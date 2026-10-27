function Register() {
  return (
    <section className="auth-section">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Join FixMate today</p>

        <label>Full Name</label>
        <input type="text" placeholder="Enter your name" />

        <label>Email Address</label>
        <input type="email" placeholder="Enter your email" />

        <label>Phone Number</label>
        <input type="tel" placeholder="Enter your phone number" />

        <label>Password</label>
        <input type="password" placeholder="Create a password" />

        <label>Register As</label>
        <select>
          <option>Customer</option>
          <option>Service Provider</option>
        </select>

        <button>Register</button>

        <p className="auth-bottom">
          Already have an account? <span>Login</span>
        </p>
      </div>
    </section>
  );
}

export default Register;