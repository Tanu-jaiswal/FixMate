function Providers() {
  const providers = [
    {
      name: "Rahul Sharma",
      service: "Plumber",
      experience: "5 Years Experience",
      location: "Meerut",
      price: "₹300 / Visit",
      rating: "4.8",
    },
    {
      name: "Amit Kumar",
      service: "Electrician",
      experience: "7 Years Experience",
      location: "Meerut",
      price: "₹350 / Visit",
      rating: "4.9",
    },
    {
      name: "Vikas Singh",
      service: "AC Repair",
      experience: "6 Years Experience",
      location: "Meerut",
      price: "₹400 / Visit",
      rating: "4.7",
    },
    {
      name: "Rohit Verma",
      service: "Carpenter",
      experience: "8 Years Experience",
      location: "Meerut",
      price: "₹500 / Visit",
      rating: "4.8",
    },
  ];

  return (
    <section className="providers-section">
      <div className="section-title">
        <h2>Trusted Professionals</h2>
        <p>Find experienced professionals near you</p>
      </div>

      <div className="provider-grid">
        {providers.map((provider) => (
          <div className="provider-card" key={provider.name}>
            <div className="provider-avatar">
              {provider.name.charAt(0)}
            </div>

            <h3>{provider.name}</h3>

            <p className="provider-service">
              {provider.service}
            </p>

            <p>{provider.experience}</p>
            <p>📍 {provider.location}</p>
            <p>⭐ {provider.rating}</p>

            <div className="provider-bottom">
              <strong>{provider.price}</strong>
              <button>Book Now</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Providers;