import "./App.css";

import Services from "./Services";
import HowItWorks from "./HowItWorks";
import About from "./About";
import Contact from "./Contact";
import Login from "./Login";
import Providers from "./Providers";

function App() {
  return (
    <div>

      {/* ================= NAVBAR ================= */}
      <nav className="navbar">

        <div className="logo">
          FixMate
        </div>

        <ul className="nav-links">

          <li>
            <a href="#">Home</a>
          </li>

          <li>
            <a href="#services">Services</a>
          </li>
          <li>
            <a href="#providers">Professionals</a>
          </li>

          <li>
            <a href="#how-it-works">How It Works</a>
          </li>

          <li>
            <a href="#about">About</a>
          </li>

          <li>
            <a href="#contact">Contact</a>
          </li>

          <li>
            <a href="#login">Login</a>
          </li>

          <li>
            <a href="#provider" className="provider-btn">
              Become a Provider
            </a>
          </li>

        </ul>

      </nav>


      {/* ================= HERO ================= */}
      <section className="hero">

        <div className="hero-badge">
          ⭐ Trusted Local Service Platform
        </div>

        <h1>
          Find Trusted <span>Professionals</span> Near You
        </h1>

        <p>
          From plumbing and electrical repairs to cleaning and computer
          services, find reliable professionals for your everyday needs.
        </p>


        <div className="search-box">

          <input
            type="text"
            placeholder="🔍  What service do you need?"
          />

          <input
            type="text"
            placeholder="📍  Enter your location"
          />

          <button>
            Find Services
          </button>

        </div>


        <div className="hero-stats">

          <div>
            <h3>500+</h3>
            <p>Professionals</p>
          </div>

          <div>
            <h3>1,000+</h3>
            <p>Services Completed</p>
          </div>

          <div>
            <h3>4.8 ⭐</h3>
            <p>Average Rating</p>
          </div>

        </div>

      </section>


      {/* ================= SERVICES ================= */}
      <section id="services">
        <Services />
      </section>

      <section id="provider">
        <Providers />
      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works">
        <HowItWorks />
      </section>


      {/* ================= ABOUT ================= */}
      <section id="about">
        <About />
      </section>


      {/* ================= CONTACT ================= */}
      <section id="contact">
        <Contact />
      </section>


      {/* ================= LOGIN ================= */}
      <section id="login">
        <Login />
      </section>


      {/* ================= FOOTER ================= */}
      <footer className="footer">

        <div className="footer-content">

          <div>
            <h2>FixMate</h2>
            <p>
              Connecting you with trusted local professionals.
            </p>
          </div>

          <div>
            <h3>Quick Links</h3>

            <a href="#">Home</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>

          <div>
            <h3>For Professionals</h3>

            <a href="#provider">Become a Provider</a>
            <a href="#login">Provider Login</a>
          </div>

        </div>

        <div className="footer-bottom">
          <p>
            © 2026 FixMate. All rights reserved.
          </p>
        </div>

      </footer>

    </div>
  );
}

export default App;