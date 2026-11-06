import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./App.css";
import "./polish.css";
import { apiRequest } from "./api";
import { useAuth } from "./useAuth";
import Account from "./Account";
import AdminDashboard from "./AdminDashboard";
import About from "./About";
import Booking from "./Booking";
import Contact from "./Contact";
import HowItWorks from "./HowItWorks";
import Login from "./Login";
import Providers from "./Providers";
import Register from "./Register";
import Services from "./Services";

function getIntendedPath(location, user) {
  const intendedPath = location.state?.from?.pathname;
  if (typeof intendedPath === "string" && intendedPath.startsWith("/") && !intendedPath.startsWith("//")) {
    if (user?.role === "admin" && !intendedPath.startsWith("/admin")) {
      return "/admin";
    }
    return `${intendedPath}${location.state.from.search || ""}${location.state.from.hash || ""}`;
  }
  if (user?.role === "admin") return "/admin";
  return user?.role === "provider" ? "/providers" : "/";
}

function RequireRole({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="loading-message" role="status">Checking your sign-in…</p>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!roles.includes(user.role)) {
    return <Navigate to={getIntendedPath({}, user)} replace />;
  }
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="loading-message" role="status">Checking your sign-in…</p>;
  }
  if (user) {
    return <Navigate to={getIntendedPath(location, user)} replace />;
  }
  return children;
}

function HomePage({ filters, search, setSearch, handleSearch, handleBook, selectedService, onClearSelection, onMessage }) {
  return (
    <>
      <section className="hero">
        <div className="hero-badge">Trusted local service platform</div>
        <h1>Find Trusted <span>Professionals</span> Near You</h1>
        <p>
          From plumbing and electrical repairs to cleaning and computer
          services, find reliable professionals for your everyday needs.
        </p>
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="search"
            aria-label="Service category"
            placeholder="What service do you need?"
            value={search.category}
            onChange={(event) => setSearch({ ...search, category: event.target.value })}
          />
          <input
            type="search"
            aria-label="Location"
            placeholder="Enter your city"
            value={search.location}
            onChange={(event) => setSearch({ ...search, location: event.target.value })}
          />
          <button type="submit">Find Services</button>
        </form>
        <div className="hero-stats">
          <div><h3>Local</h3><p>Independent professionals</p></div>
          <div><h3>Flexible</h3><p>Book on your schedule</p></div>
          <div><h3>Secure</h3><p>Account-based requests</p></div>
        </div>
      </section>
      <section id="services"><Services filters={filters} onBook={handleBook} /></section>
      <section id="providers"><Providers filters={filters} /></section>
      <section id="how-it-works"><HowItWorks /></section>
      <section id="about"><About /></section>
      <section id="booking">
        <Booking
          selectedService={selectedService}
          onClearSelection={onClearSelection}
          onMessage={onMessage}
        />
      </section>
      <section id="contact"><Contact /></section>
    </>
  );
}

function AppContent() {
  const { user, setUser, authError, setAuthError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ category: "", location: "" });
  const [search, setSearch] = useState({ category: "", location: "" });
  const [selectedService, setSelectedService] = useState(null);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleSearch = (event) => {
    event.preventDefault();
    setFilters(search);
    navigate("/services");
  };

  const handleBook = (service) => {
    const serviceId = encodeURIComponent(service._id);
    const bookingPath = `/bookings?serviceId=${serviceId}`;
    if (!user) {
      setSelectedService(service);
      setNotice("Sign in or create an account to request this service.");
      navigate("/login", {
        state: { from: { pathname: "/bookings", search: `?serviceId=${serviceId}` } },
      });
      return;
    }
    if (user.role !== "user") {
      setNotice("Customer accounts can request bookings. Sign in with a customer account to book.");
      return;
    }
    setNotice("");
    setSelectedService(service);
    navigate(bookingPath);
  };

  const handleAuth = (currentUser) => {
    setUser(currentUser);
    setAuthError("");
    setNotice(`Welcome${currentUser.name ? `, ${currentUser.name}` : ""}.`);
    const destination = selectedService && currentUser.role === "user"
      ? "/bookings"
      : getIntendedPath(location, currentUser);
    navigate(destination, { replace: true });
  };

  const clearSelectedService = () => {
    setSelectedService(null);
    if (location.pathname === "/bookings" && location.search) {
      navigate("/bookings", { replace: true });
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      setUser(null);
      setSelectedService(null);
      setNotice("You have been signed out.");
      navigate("/", { replace: true });
    } catch (error) {
      setNotice(error.message);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div>
      <nav className="navbar">
        <Link className="logo" to="/" onClick={closeMenu}>FixMate</Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <ul id="primary-navigation" className={`nav-links${menuOpen ? " is-open" : ""}`}>
          <li><Link to="/" onClick={closeMenu}>Home</Link></li>
          <li><Link to="/services" onClick={closeMenu}>Services</Link></li>
          <li><Link to="/providers" onClick={closeMenu}>Professionals</Link></li>
          <li><Link to="/how-it-works" onClick={closeMenu}>How It Works</Link></li>
          {user ? (
            <>
              <li><span className="nav-welcome">Welcome, {user.name}</span></li>
              <li><Link to="/bookings" onClick={closeMenu}>Bookings</Link></li>
              {user.role === "provider" && (
                <li><Link to="/providers" onClick={closeMenu}>Provider workspace</Link></li>
              )}
              {user.role === "admin" && (
                <li><Link to="/admin" onClick={closeMenu}>Admin dashboard</Link></li>
              )}
              {user.role !== "admin" && (
                <li><Link to="/account" onClick={closeMenu}>My profile</Link></li>
              )}
              <li><button className="nav-action" type="button" onClick={handleLogout}>Sign out</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
              <li><Link to="/register" onClick={closeMenu}>Create account</Link></li>
            </>
          )}
        </ul>
      </nav>

      <main>
        {(authError || notice) && (
          <div className={`app-notice${authError ? " is-error" : ""}`} role="status">
            {authError || notice}
            <button type="button" aria-label="Dismiss message" onClick={() => {
              setNotice("");
              setAuthError("");
            }}>×</button>
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                filters={filters}
                search={search}
                setSearch={setSearch}
                handleSearch={handleSearch}
                handleBook={handleBook}
                selectedService={selectedService}
                onClearSelection={clearSelectedService}
                onMessage={setNotice}
              />
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login onAuthenticated={handleAuth} />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register onAuthenticated={handleAuth} />
              </GuestRoute>
            }
          />
          <Route path="/services" element={<Services filters={filters} onBook={handleBook} />} />
          <Route path="/providers" element={<Providers filters={filters} />} />
          <Route
            path="/bookings"
            element={
              <RequireRole roles={["user", "provider"]}>
                <Booking
                  selectedService={selectedService}
                  onClearSelection={clearSelectedService}
                  onMessage={setNotice}
                />
              </RequireRole>
            }
          />
          <Route
            path="/account"
            element={
              <RequireRole roles={["user", "provider"]}>
                <Account />
              </RequireRole>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole roles={["admin"]}>
                <AdminDashboard />
              </RequireRole>
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div>
            <h2>FixMate</h2>
            <p>Connecting you with trusted local professionals.</p>
          </div>
          <div>
            <h3>Quick Links</h3>
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <h3>For Professionals</h3>
            <Link to="/register">Create a provider account</Link>
            <Link to="/providers">Manage your services</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 FixMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
