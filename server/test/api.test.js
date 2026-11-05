const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const app = require("../server");
const { canCustomerCancel, canProviderSetStatus } = require("../utils/bookingTransitions");
const { samples } = require("../scripts/seedServices");

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
  const response = await fetch(`${baseUrl}/api/bookings/mine`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.match(body.message, /sign in/i);
});

test("registration validates input before attempting database writes", async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "A", email: "not-an-email", password: "short", role: "admin" }),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(body.message, /name/i);
});

test("provider service mutations require provider authentication", async () => {
  const response = await fetch(`${baseUrl}/api/services`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Repair", category: "Home", description: "Repair work", price: 100, city: "Meerut" }),
  });

  assert.equal(response.status, 401);
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

test("sample service seed contains the requested listings with unique seed keys", () => {
  assert.deepEqual(
    samples.map((service) => service.category).sort(),
    ["AC Repair", "Carpenter", "Cleaning", "Electrician", "Plumber"].sort()
  );
  assert.equal(new Set(samples.map((service) => service.seedKey)).size, samples.length);
});
