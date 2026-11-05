import { useCallback, useEffect, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, MapPin, UserRound } from "lucide-react";
import { apiRequest } from "./api";
import { useAuth } from "./useAuth";

function getProviderInitials(name) {
  if (!name?.trim()) return null;
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

function ProviderWorkspace() {
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadWorkspace = useCallback(async () => {
    try {
      const [{ provider }, { services: allServices }] = await Promise.all([
        apiRequest("/providers/me"),
        apiRequest("/services"),
      ]);
      setProfile(provider);
      setServices(allServices.filter((service) => service.provider?._id === provider._id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest("/providers/me"), apiRequest("/services")])
      .then(([{ provider }, { services: allServices }]) => {
        if (active) {
          setProfile(provider);
          setServices(allServices.filter((service) => service.provider?._id === provider._id));
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSavingProfile(true);
    const formData = new FormData(event.currentTarget);
    try {
      const { provider } = await apiRequest("/providers/me", {
        method: "PATCH",
        body: {
          bio: formData.get("bio"),
          city: formData.get("city"),
          experienceYears: Number(formData.get("experienceYears")),
          specialties: String(formData.get("specialties"))
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        },
      });
      setProfile(provider);
      setMessage("Provider profile saved.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function createService(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSavingService(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await apiRequest("/services", {
        method: "POST",
        body: {
          name: formData.get("name"),
          category: formData.get("category"),
          description: formData.get("description"),
          price: Number(formData.get("price")),
          city: formData.get("city"),
        },
      });
      form.reset();
      await loadWorkspace();
      setMessage("Service listing published.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingService(false);
    }
  }

  async function removeService(serviceId) {
    setError("");
    setMessage("");
    try {
      await apiRequest(`/services/${serviceId}`, { method: "DELETE" });
      setServices((current) => current.filter((service) => service._id !== serviceId));
      setMessage("Service listing removed.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (loading) {
    return <p className="loading-message" role="status">Loading your provider workspace…</p>;
  }
  if (!profile) {
    return <p className="form-message is-error" role="alert">{error || "Provider profile could not be loaded."}</p>;
  }

  return (
    <div className="provider-workspace">
      <div className="workspace-heading">
        <div>
          <span className="about-label">PROVIDER WORKSPACE</span>
          <h3>Manage your profile and services</h3>
        </div>
        <span className={`availability-badge${profile.isActive ? "" : " is-unavailable"}`}>
          {profile.isActive ? "Visible in search" : "Hidden from search"}
        </span>
      </div>
      {error && <p className="form-message is-error" role="alert">{error}</p>}
      {message && <p className="form-message" role="status">{message}</p>}
      <div className="workspace-grid">
        <form className="workspace-card" onSubmit={saveProfile}>
          <h4>Profile</h4>
          <label htmlFor="provider-city">Service City</label>
          <input id="provider-city" name="city" defaultValue={profile.city} maxLength="100" required />
          <label htmlFor="provider-specialties">Specialties (comma-separated)</label>
          <input id="provider-specialties" name="specialties" defaultValue={profile.specialties.join(", ")} required />
          <label htmlFor="provider-experience">Years of Experience</label>
          <input id="provider-experience" name="experienceYears" type="number" min="0" max="80" defaultValue={profile.experienceYears} required />
          <label htmlFor="provider-bio">About Your Work</label>
          <textarea id="provider-bio" name="bio" rows="4" maxLength="1000" defaultValue={profile.bio} />
          <button type="submit" disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save Profile"}
          </button>
        </form>

        <div className="workspace-card">
          <h4>Publish a service</h4>
          <form className="workspace-form" onSubmit={createService}>
            <label htmlFor="service-name">Listing Name</label>
            <input id="service-name" name="name" maxLength="120" required />
            <label htmlFor="service-category">Category</label>
            <input id="service-category" name="category" maxLength="80" required />
            <label htmlFor="service-city">Service City</label>
            <input id="service-city" name="city" maxLength="100" defaultValue={profile.city} required />
            <label htmlFor="service-price">Price per visit (₹)</label>
            <input id="service-price" name="price" type="number" min="0" step="1" required />
            <label htmlFor="service-description">Description</label>
            <textarea id="service-description" name="description" rows="3" maxLength="1000" required />
            <button type="submit" disabled={savingService}>
              {savingService ? "Publishing…" : "Publish Service"}
            </button>
          </form>
        </div>
      </div>

      <div className="workspace-listings">
        <h4>Your service listings</h4>
        {services.length === 0 && <p className="empty-state">You haven&apos;t published a service yet.</p>}
        {services.map((service) => (
          <div className="listing-row" key={service._id}>
            <div>
              <strong>{service.name}</strong>
              <span>{service.category} · {service.city} · ₹{service.price}/visit</span>
            </div>
            <button className="secondary-button" type="button" onClick={() => removeService(service._id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Providers({ filters }) {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams();
    if (filters.category) query.set("category", filters.category);
    if (filters.location) query.set("location", filters.location);

    apiRequest(`/providers${query.size ? `?${query}` : ""}`)
      .then(({ providers: result }) => {
        if (active) setProviders(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

  return (
    <section className="providers-section">
      {user?.role === "provider" ? (
        <ProviderWorkspace />
      ) : (
        <>
          <div className="section-title">
            <h2>Local Professionals</h2>
            <p>Discover providers serving your area</p>
          </div>
          {loading && <p className="loading-message" role="status">Loading professionals…</p>}
          {error && <p className="form-message is-error" role="alert">{error}</p>}
          {!loading && !error && providers.length === 0 && (
            <p className="empty-state">No providers match this search yet.</p>
          )}
          {providers.length > 0 && (
            <div className="provider-grid">
              {providers.map((provider) => (
                <article className="provider-card" key={provider._id}>
                  {getProviderInitials(provider.user?.name) ? (
                    <div className="provider-avatar" aria-hidden="true">
                      {getProviderInitials(provider.user.name)}
                    </div>
                  ) : (
                    <div className="provider-avatar" aria-hidden="true">
                      <UserRound size={27} strokeWidth={1.8} />
                    </div>
                  )}
                  <div className="provider-verified">
                    <CheckCircle2 size={15} strokeWidth={2.2} aria-hidden="true" />
                    <span>Verified</span>
                  </div>
                  <h3>{provider.user?.name || "Local professional"}</h3>
                  <div className="provider-specialties" aria-label="Service categories">
                    {provider.specialties.map((specialty) => (
                      <span className="provider-specialty" key={specialty}>{specialty}</span>
                    ))}
                  </div>
                  <div className="provider-details">
                    <p>
                      <BriefcaseBusiness size={16} aria-hidden="true" />
                      <span>{provider.experienceYears} years of experience</span>
                    </p>
                    <p>
                      <MapPin size={16} aria-hidden="true" />
                      <span>{provider.city}</span>
                    </p>
                  </div>
                  {provider.bio && <p className="provider-bio">{provider.bio}</p>}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Providers;
