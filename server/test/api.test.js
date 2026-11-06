const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const jwt = require("jsonwebtoken");
const app = require("../server");
const User = require("../models/User");
const { canCustomerCancel, canProviderSetStatus } = require("../utils/bookingTransitions");
const getSessionCookieOptions = require("../utils/sessionCookieOptions");
const { allowRoles, requireAuth } = require("../middleware/auth");
const { samples } = require("../scripts/seedServices");
const testJwtSecret = "fixmate-unit-test-secret-that-is-not-used-in-production";

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("health endpoint reports API availability without exposing configuration", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.database, "disconnected");
  assert.equal("mongoUri" in body, false);
});

test("booking APIs reject anonymous requests", async () => {
  const protectedRequests = [
    ["GET", "/api/auth/me"],
    ["GET", "/api/bookings/mine"],
    ["GET", "/api/bookings/provider"],
    ["POST", "/api/bookings"],
    ["PATCH", "/api/bookings/example/cancel"],
    ["PATCH", "/api/bookings/example/status"],
  ];
  for (const [method, path] of protectedRequests) {
    const response = await fetch(`${baseUrl}${path}`, { method });
    const body = await response.json();

    assert.equal(response.status, 401, `${method} ${path}`);
    assert.match(body.message, /sign in/i);
  }
});

test("registration validates input before attempting database writes", async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "A", email: "not-an-email", password: "short", role: "visitor" }),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(body.message, /name/i);
});

test("invalid login payload is rejected without a database lookup", async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "", password: "" }),
  });

  assert.equal(response.status, 400);
});

test("provider service mutations require provider authentication", async () => {
  const response = await fetch(`${baseUrl}/api/services`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Repair", category: "Home", description: "Repair work", price: 100, city: "Meerut" }),
  });

  assert.equal(response.status, 401);
});

test("role guards reject customers from provider actions", () => {
  for (const role of ["provider"]) {
    let responseStatus;
    let responseBody;
    let passedToNext = false;
    const response = {
      status(status) {
        responseStatus = status;
        return this;
      },
      json(body) {
        responseBody = body;
        return this;
      },
    };

    allowRoles(role)({ user: { role: "user" } }, response, () => {
      passedToNext = true;
    });

    assert.equal(responseStatus, 403);
    assert.match(responseBody.message, /permission/i);
    assert.equal(passedToNext, false);
  }
});

test("JWT authentication uses the current database role rather than the token role claim", async () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalFindById = User.findById;
  const databaseUser = { _id: "unit-test-user", role: "user" };
  process.env.JWT_SECRET = testJwtSecret;
  User.findById = () => ({ select: async () => databaseUser });

  try {
    const token = jwt.sign(
      { sub: databaseUser._id, role: "provider" },
      testJwtSecret,
      { algorithm: "HS256", expiresIn: "1m" }
    );
    const request = {
      headers: {},
      get: (name) => name.toLowerCase() === "authorization" ? `Bearer ${token}` : undefined,
    };
    const response = {
      status(status) {
        this.statusCode = status;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };
    const nextError = await new Promise((resolve) => requireAuth(request, response, resolve));

    assert.ifError(nextError);
    assert.equal(request.user.role, "user");
    assert.equal(response.statusCode, undefined);
  } finally {
    User.findById = originalFindById;
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  }
});

test("service detail endpoint is registered and validates service IDs", async () => {
  const response = await fetch(`${baseUrl}/api/services/not-a-service-id`);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(body.message, /invalid/i);
});

test("booking status transitions are restricted by actor and current state", () => {
  assert.equal(canProviderSetStatus("pending", "accepted"), true);
  assert.equal(canProviderSetStatus("accepted", "in_progress"), true);
  assert.equal(canProviderSetStatus("in_progress", "completed"), true);
  assert.equal(canProviderSetStatus("pending", "completed"), false);
  assert.equal(canProviderSetStatus("completed", "accepted"), false);
  assert.equal(canCustomerCancel("pending"), true);
  assert.equal(canCustomerCancel("accepted"), true);
  assert.equal(canCustomerCancel("completed"), false);
});

test("session cookies support cross-origin production requests without weakening local development", () => {
  const productionOptions = getSessionCookieOptions("production");
  assert.equal(productionOptions.httpOnly, true);
  assert.equal(productionOptions.secure, true);
  assert.equal(productionOptions.sameSite, "none");

  const developmentOptions = getSessionCookieOptions("development");
  assert.equal(developmentOptions.httpOnly, true);
  assert.equal(developmentOptions.secure, false);
  assert.equal(developmentOptions.sameSite, "lax");

  const renderOptions = getSessionCookieOptions("development", true);
  assert.equal(renderOptions.secure, true);
  assert.equal(renderOptions.sameSite, "none");
});

test("sample service seed contains the requested listings with unique seed keys", () => {
  assert.deepEqual(
    samples.map((service) => service.category).sort(),
    ["AC Repair", "Carpenter", "Cleaning", "Electrician", "Plumber"].sort()
  );
  assert.equal(new Set(samples.map((service) => service.seedKey)).size, samples.length);
});
