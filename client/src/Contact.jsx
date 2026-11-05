const supportEmail = "tanujaiswal676@gmail.com";

function Contact() {
  function prepareEmail(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = `[FixMate] ${formData.get("subject")}`;
    const message = [
      `Name: ${formData.get("name")}`,
      `Email: ${formData.get("email")}`,
      `Phone: ${formData.get("phone")}`,
      "",
      formData.get("message"),
    ].join("\n");
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  }

  return (
    <section id="contact" className="contact">
      <div className="section-title">
        <h2>Contact Us</h2>
        <p>Have a question? We'd love to hear from you.</p>
      </div>

      <div className="contact-container">

        {/* Contact Information */}
        <div className="contact-info">
          <h3>Get in Touch</h3>

          <p>
            Need help with a service or have a question about FixMate?
            Contact us and our team will be happy to help.
          </p>

          <div className="contact-item">
            <strong>👤 Name</strong>
            <span>Tanu Jaiswal</span>
          </div>

          <div className="contact-item">
            <strong>📧 Email</strong>
            <span>{supportEmail}</span>
          </div>

          <div className="contact-item">
            <strong>📞 Phone</strong>
            <span>7607304999</span>
          </div>

          <div className="contact-item">
            <strong>📍 Location</strong>
            <span>Uttar Pradesh, India</span>
          </div>

          <div className="contact-item">
            <strong>🕒 Support Hours</strong>
            <span>Monday - Saturday, 9:00 AM - 7:00 PM</span>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form">
          <h3>Send us a Message</h3>

          <form onSubmit={prepareEmail}>
            <input
              type="text"
              name="name"
              placeholder="Your Full Name"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email Address"
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Your Phone Number"
              required
            />

            <select name="subject" required defaultValue="">
              <option value="" disabled>
                Select Subject
              </option>
              <option value="service">Service Related</option>
              <option value="booking">Booking Related</option>
              <option value="provider">Become a Provider</option>
              <option value="complaint">Complaint</option>
              <option value="other">Other</option>
            </select>

            <textarea
              name="message"
              placeholder="Write your message..."
              required
            ></textarea>

            <p className="contact-helper">Your email app will open with this message ready to send.</p>
            <button type="submit">
              Open Email App
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}

export default Contact;