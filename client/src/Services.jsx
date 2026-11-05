import { useEffect, useState } from "react";
import { Hammer, Snowflake, Sparkles, Wrench, Zap } from "lucide-react";
import { apiRequest } from "./api";

const categoryIcons = [
  { match: /carpent/i, Icon: Hammer },
  { match: /clean/i, Icon: Sparkles },
  { match: /ac repair|air.?condition/i, Icon: Snowflake },
  { match: /plumb/i, Icon: Wrench },
  { match: /electric/i, Icon: Zap },
];

function getServiceIcon(service) {
  const searchText = `${service.category || ""} ${service.name || ""}`;
  return categoryIcons.find(({ match }) => match.test(searchText))?.Icon || Wrench;
}

function Services({ filters, onBook }) {
  const [result, setResult] = useState({ query: null, services: [], error: "" });
  const query = new URLSearchParams();
  if (filters.category) query.set("category", filters.category);
  if (filters.location) query.set("location", filters.location);
  const queryString = query.toString();
  const loading = result.query !== queryString;
  const services = loading ? [] : result.services;
  const error = loading ? "" : result.error;

  useEffect(() => {
    let active = true;

    apiRequest(`/services${queryString ? `?${queryString}` : ""}`)
      .then(({ services: result }) => {
        if (!Array.isArray(result)) {
          throw new Error("The services API returned an invalid response.");
        }
        if (active) setResult({ query: queryString, services: result, error: "" });
      })
      .catch((requestError) => {
        if (active) setResult({ query: queryString, services: [], error: requestError.message });
      });

    return () => {
      active = false;
    };
  }, [queryString]);

  return (
    <section className="services">
      <div className="section-title">
        <h2>Local Services</h2>
        <p>Browse current service listings from local professionals</p>
      </div>
      {loading && <p className="loading-message" role="status">Loading services…</p>}
      {error && <p className="form-message is-error" role="alert">{error}</p>}
      {!loading && !error && services.length === 0 && (
        <p className="empty-state">
          No services match this search yet. Try another location or check back later.
        </p>
      )}
      {!error && services.length > 0 && (
        <div className="service-grid">
          {services.map((service) => {
            const Icon = getServiceIcon(service);
            return (
              <article className="service-card" key={service._id}>
                <div className="service-icon" aria-hidden="true">
                  <Icon size={25} strokeWidth={1.8} />
                </div>
                <p className="service-category">{service.category}</p>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <p className="service-provider">
                  {service.provider?.user?.name || "Local professional"} · {service.city}
                </p>
                <div className="service-card-footer">
                  <strong>₹{Number(service.price).toLocaleString("en-IN")} / visit</strong>
                  <button type="button" onClick={() => onBook(service)}>Request booking</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Services;
