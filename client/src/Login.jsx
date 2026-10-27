function Login() {
  return (
    <section className="login-section">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Login to your FixMate account</p>
        </div>

        <form className="login-form">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
          />

          <div className="login-options">
            <label className="remember">
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <p className="register-text">
          Don't have an account? <a href="#">Create Account</a>
        </p>
      </div>
    </section>
  );
}

export default Login;