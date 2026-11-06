function getSessionCookieOptions(
  environment = process.env.NODE_ENV,
  isRender = process.env.RENDER === "true"
) {
  const isProduction = environment === "production" || isRender;

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

module.exports = getSessionCookieOptions;
