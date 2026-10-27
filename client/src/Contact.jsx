function Contact() {
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
            <span>tanujaiswal676@gmail.com</span>
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you! Your message has been submitted.");
            }}
          >
            <input
              type="text"
              placeholder="Your Full Name"
              required
            />

            <input
              type="email"
              placeholder="Your Email Address"
              required
            />

            <input
              type="tel"
              placeholder="Your Phone Number"
              required
            />

            <select required defaultValue="">
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
              placeholder="Write your message..."
              required
            ></textarea>

            <button type="submit">
              Send Message
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}

export default Contact;