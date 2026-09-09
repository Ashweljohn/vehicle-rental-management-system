import React from 'react';

const About = () => (
  <div className="container section">
    <h2 className="section-title">About RentalHub</h2>
    <p className="section-subtitle" style={{ maxWidth: 720 }}>
      RentalHub is a demo vehicle rental platform built for an academic project. It showcases a
      full booking workflow — search, book, pick up, return, and cancel — across cars, bikes, and
      more, spanning three demo branches.
    </p>

    <div className="row g-4 mt-2">
      <div className="col-md-4">
        <div className="card p-4 h-100">
          <h5>Our mission</h5>
          <p className="text-muted mb-0">
            Make renting a vehicle as simple as booking a hotel room — transparent pricing, clear
            availability, and no surprises at pickup.
          </p>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card p-4 h-100">
          <h5>Our fleet</h5>
          <p className="text-muted mb-0">
            From city hatchbacks to touring bikes, our branches carry a mix of vehicles maintained
            to a consistent standard, with condition checked at every pickup and return.
          </p>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card p-4 h-100">
          <h5>Our branches</h5>
          <p className="text-muted mb-0">
            Currently operating out of Bengaluru, Mumbai, and Delhi, with more branches planned as
            the platform grows.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default About;
