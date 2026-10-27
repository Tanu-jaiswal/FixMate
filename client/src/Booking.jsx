import { useState } from "react";

function Booking() {
  const [booking, setBooking] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    address: "",
    problem: "",
  });

  const handleChange = (e) => {
    setBooking({
      ...booking,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Booking request submitted successfully!");

    console.log("Booking Data:", booking);
  };

  return (
    <section className="booking-section">
      <div className="booking-container">

        <div className="booking-header">
          <span>FIXMATE BOOKING</span>

          <h2>Book a Professional</h2>

          <p>
            Fill in your details and choose a convenient time for your service.
          </p>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>

          <div className="form-row">
            <div>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={booking.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={booking.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Service Date</label>
              <input
                type="date"
                name="date"
                value={booking.date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Preferred Time</label>
              <input
                type="time"
                name="time"
                value={booking.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label>Service Address</label>

          <textarea
            name="address"
            placeholder="Enter complete service address"
            value={booking.address}
            onChange={handleChange}
            required
          ></textarea>

          <label>Describe Your Problem</label>

          <textarea
            name="problem"
            placeholder="Example: Kitchen tap is leaking..."
            value={booking.problem}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit">
            Confirm Booking
          </button>

        </form>
      </div>
    </section>
  );
}

export default Booking;