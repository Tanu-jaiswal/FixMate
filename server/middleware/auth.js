const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE_NAME = "fixmate_token";

function getToken(req) {
  const authorization = req.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.slice(7);
  }

  const cookie = (req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  return cookie ? cookie.slice(COOKIE_NAME.length + 1) : null;
}

async function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) {
    res.status(401).json({ message: "Please sign in to continue." });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    const user = await User.findById(payload.sub).select("-password");

    if (!user) {
      res.status(401).json({ message: "This account is no longer available." });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Your session has expired. Please sign in again." });
      return;
    }

    next(error);
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "You do not have permission to perform this action." });
      return;
    }
    next();
  };
}

module.exports = { COOKIE_NAME, requireAuth, allowRoles };
