function About() {
  return (
    <section className="about" id="about">
      <div className="about-content">

        <div className="about-text">
          <span className="about-label">ABOUT FIXMATE</span>

          <h2>
            Your Trusted Partner for
            <span> Local Services</span>
          </h2>

          <p>
            FixMate is a smart local service booking platform that connects
            customers with trusted professionals in their area.
          </p>

          <p>
            Whether you need a plumber, electrician, cleaner, carpenter,
            computer technician or another skilled professional, FixMate
            makes finding and booking the right person simple.
          </p>

          <div className="about-features">
            <div>
              <strong>✓</strong>
              <span>Local provider profiles</span>
            </div>

            <div>
              <strong>✓</strong>
              <span>Account-based booking requests</span>
            </div>

            <div>
              <strong>✓</strong>
              <span>Clear service descriptions and pricing</span>
            </div>

            <div>
              <strong>✓</strong>
              <span>Booking status updates</span>
            </div>
          </div>
        </div>

        <div className="about-card">
          <div className="about-icon">🛠️</div>

          <h3>Why Choose FixMate?</h3>

          <p>
            Find local service listings, request appointments, and follow each
            booking through its current status.
          </p>

          <div className="about-stats">
            <p>Customer accounts</p>
            <p>Provider workspaces</p>
            <p>Booking history</p>
          </div>
        </div>

      </div>
    </section>
  );
}

export default About;