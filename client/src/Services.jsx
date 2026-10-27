function Services() {
  const services = [
    {
      icon: "🔧",
      name: "Plumbing",
      description: "Pipes, taps, leaks and bathroom repairs",
    },
    {
      icon: "⚡",
      name: "Electrical",
      description: "Wiring, switches, fans and electrical repairs",
    },
    {
      icon: "❄️",
      name: "AC Repair",
      description: "AC service, repair and regular maintenance",
    },
    {
      icon: "🧹",
      name: "Cleaning",
      description: "Professional home and deep cleaning services",
    },
    {
      icon: "🔨",
      name: "Carpentry",
      description: "Furniture, doors and woodwork services",
    },
    {
      icon: "💻",
      name: "Computer Repair",
      description: "Laptop, desktop and software support",
    },
    {
      icon: "🎨",
      name: "Painting",
      description: "Home painting and wall finishing services",
    },
    {
      icon: "📱",
      name: "Mobile Repair",
      description: "Screen, battery and mobile device repairs",
    },
    {
      icon: "🔌",
      name: "Appliance Repair",
      description: "Repair services for common home appliances",
    },
  ];

  const handleProviderClick = (serviceName) => {
    alert(`Finding ${serviceName} professionals for you.`);
  };

  return (
    <section className="services">

      <div className="section-title">
        <h2>Popular Services</h2>
        <p>
          Find skilled professionals for all your everyday service needs
        </p>
      </div>

      <div className="service-grid">

        {services.map((service) => (
          <div className="service-card" key={service.name}>

            <div className="service-icon">
              {service.icon}
            </div>

            <h3>{service.name}</h3>

            <p>{service.description}</p>

            <button
              onClick={() => handleProviderClick(service.name)}
            >
              View Providers →
            </button>

          </div>
        ))}

      </div>

    </section>
  );
}

export default Services;