import React, { useState } from "react";

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
      setStatus({ type: "error", message: "Please fill out all fields." });
      return;
    }

    // Success Mock (This is where you would normally send data to an API/Backend)
    setStatus({
      type: "success",
      message: "Thank you! Your message has been sent.",
    });

    // Reset the form fields back to blank
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-container">
      <div className="contact-card">
        <h2>Get in Touch</h2>
        <p className="contact-subtitle">
          We would love to hear from you. Drop us a message!
        </p>

        {/* Status Notification Banner */}
        {status.message && (
          <div className={`status-banner ${status.type}`}>{status.message}</div>
        )}

        <form onSubmit={handleSubmit} className="contact-form">
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter Your Name"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Message Field */}
          <div className="form-group">
            <label htmlFor="message">Your Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Type your message here..."
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
export default ContactUs;
