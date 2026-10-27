function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: "🔍",
      title: "Choose a Service",
      description:
        "Select the service you need from our wide range of local services.",
    },
    {
      number: "02",
      icon: "👨‍🔧",
      title: "Find a Professional",
      description:
        "Browse trusted professionals, check ratings, reviews and pricing.",
    },
    {
      number: "03",
      icon: "📅",
      title: "Book a Service",
      description:
        "Choose a convenient date and time and send your booking request.",
    },
    {
      number: "04",
      icon: "⭐",
      title: "Get It Done",
      description:
        "Get your service completed and share your experience with a review.",
    },
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="section-title">
        <h2>How FixMate Works</h2>
        <p>Getting the right professional is simple and hassle-free</p>
      </div>

      <div className="steps-grid">
        {steps.map((step) => (
          <div className="step-card" key={step.number}>
            <div className="step-number">{step.number}</div>

            <div className="step-icon">{step.icon}</div>

            <h3>{step.title}</h3>

            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;