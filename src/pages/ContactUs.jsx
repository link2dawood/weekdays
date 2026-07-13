import React, { useState } from "react";
import { Link } from "react-router-dom";

function ContactUs() {
  //  One unified state object to hold all form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // State to track status notifications (success or error messages)
  const [status, setStatus] = useState({ type: "", message: "" });

  //  The universal input handler logic
  // This updates the exact field being typed into using the HTML 'name' attribute
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //  Form submission handler logic
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the page from refreshing

    // Simple validation guard
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: "error", message: "Täytä kaikki kentät." });
      return;
    }

    // Success Mock (This is where you would normally send data to an API/Backend)
    setStatus({
      type: "success",
      message: "Kiitos! Viestisi on lähetetty.",
    });

    // Reset the form fields back to blank
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section className="app">
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Ota yhteyttä
      </div>
      <div className="contact-container">
        <div className="contact-card">
          <h2>Ota yhteyttä</h2>
          <p className="contact-subtitle">
            Kuulemme mielellämme sinusta. Jätä meille viesti!
          </p>

          {/* Status Notification Banner */}
          {status.message && (
            <div className={`status-banner ${status.type}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">Koko nimi</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Syötä nimesi"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Sähköpostiosoite</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Syötä sähköpostiosoitteesi"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Message Field */}
            <div className="form-group">
              <label htmlFor="message">Viestisi</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                placeholder="Kirjoita viestisi tähän..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn">
              Lähetä viesti
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
export default ContactUs;
