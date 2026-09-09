import React, { useState } from 'react';

const Contact = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="container section">
      <h2 className="section-title">Contact us</h2>
      <p className="section-subtitle">We'd love to hear from you.</p>

      <div className="row g-4">
        <div className="col-md-5">
          <div className="card p-4 h-100">
            <h6>Head office</h6>
            <p className="text-muted mb-3">12 MG Road, Bengaluru, Karnataka, India</p>
            <h6>Phone</h6>
            <p className="text-muted mb-3">+91 98765 43210</p>
            <h6>Email</h6>
            <p className="text-muted mb-0">support@rentalhub.example</p>
          </div>
        </div>
        <div className="col-md-7">
          <div className="card p-4">
            {sent ? (
              <div className="alert alert-success mb-0">
                Thanks for reaching out — this is a demo form, so no message was actually sent.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea className="form-control" rows="4" required />
                </div>
                <button type="submit" className="btn btn-accent">
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
