import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="rh-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="brand mb-2">🚗 RentalHub</div>
            <p className="mb-0">Your journey, our vehicles.</p>
          </div>

          <div className="col-6 col-md-2">
            <h6>Quick Links</h6>
            <Link to="/">Home</Link>
            <Link to="/search">Vehicles</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="col-6 col-md-3">
            <h6>Vehicle Categories</h6>
            <Link to="/search?type=CAR">Cars</Link>
            <Link to="/search?type=BIKE">Bikes</Link>
            <Link to="/search?type=SCOOTER">Scooters</Link>
            <Link to="/search?type=BUS">Buses</Link>
            <Link to="/search?type=VAN">Vans</Link>
          </div>

          <div className="col-6 col-md-3">
            <h6>Support</h6>
            <Link to="/contact">Help Center</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/about">Terms</Link>
            <Link to="/about">Privacy</Link>
          </div>
        </div>

        <div className="socials mt-3">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">in</a>
          <a href="#" aria-label="Twitter">tw</a>
        </div>

        <hr />
        <div className="bottom-line text-center">
          © {new Date().getFullYear()} RentalHub. Built as an academic project — not a real commercial service.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
