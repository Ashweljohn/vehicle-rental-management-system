import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import vehicleService from '../services/vehicleService';
import VehicleImage from '../components/VehicleImage';
import { getCategoryImage } from '../utils/vehicleImages';

const todayISO = () => new Date().toISOString().slice(0, 10);
const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const CATEGORIES = [
  { key: 'CAR', emoji: '🚗', title: 'Cars', desc: 'Sedans, SUVs, hatchbacks' },
  { key: 'BIKE', emoji: '🏍', title: 'Bikes', desc: 'Sports, commuter, cruiser' },
  { key: 'SCOOTER', emoji: '🛵', title: 'Scooters', desc: 'Perfect for city travel' },
  { key: 'BUS', emoji: '🚌', title: 'Buses', desc: 'Group & tourist travel' },
  { key: 'VAN', emoji: '🚐', title: 'Vans', desc: 'Cargo & family trips' },
  { key: 'TRUCK', emoji: '🚚', title: 'Trucks', desc: 'Light commercial hauling' },
  { key: 'AUTO', emoji: '🛺', title: 'Auto Rickshaws', desc: 'Quick local hops' },
  { key: 'LUXURY', emoji: '✨', title: 'Luxury', desc: 'Premium ride experience' },
];

const PROMOS = [
  {
    title: 'Weekend Getaways Made Easy',
    subtitle: 'Special discounts on weekend rentals',
    cta: 'Explore Cars',
    type: 'CAR',
    img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Ride the Freedom',
    subtitle: 'Bikes & scooters at best prices',
    cta: 'Explore Bikes',
    type: 'BIKE',
    img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Travel Together',
    subtitle: 'Spacious vans & buses for groups',
    cta: 'Explore Vans',
    type: 'VAN',
    img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  },
];

const STEPS = [
  { n: '01', title: 'Search', desc: 'Find your perfect vehicle', icon: '🔍' },
  { n: '02', title: 'Book', desc: 'Choose dates & confirm', icon: '🗓️' },
  { n: '03', title: 'Pick up', desc: 'Get your vehicle', icon: '🔑' },
  { n: '04', title: 'Drive', desc: 'Enjoy your journey', icon: '🛣️' },
];

const WHY_US = [
  { icon: '✓', title: 'Verified vehicles', desc: 'Every vehicle is inspected before it goes live.' },
  { icon: '₹', title: 'Affordable pricing', desc: 'Transparent per-day rates, no hidden fees.' },
  { icon: '⚡', title: 'Easy booking', desc: 'Search, book and confirm in under a minute.' },
  { icon: '📍', title: 'Multiple branches', desc: 'Pick up and return across our branch network.' },
  { icon: '🔒', title: 'Secure payments', desc: 'Your transactions are handled safely.' },
  { icon: '🕒', title: '24/7 support', desc: "We're here whenever you need help." },
];

const TESTIMONIALS = [
  {
    name: 'Ananya R.',
    location: 'Bengaluru',
    quote:
      'Great service and well-maintained vehicles. The booking process was smooth and easy from start to finish.',
  },
  {
    name: 'Rohit S.',
    location: 'Mumbai',
    quote:
      'Picked up a bike for a weekend trip — the pickup inspection took two minutes and the bike was spotless.',
  },
  {
    name: 'Priya M.',
    location: 'Delhi',
    quote:
      'Cancelled a booking last minute and the refund policy was exactly as described. No surprises, no hassle.',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [type, setType] = useState('');
  const [branchId, setBranchId] = useState('');
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(tomorrowISO());
  const [branches, setBranches] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    vehicleService.getBranches().then((res) => setBranches(res.data)).catch(() => {});
    vehicleService
      .getVehicles({ status: 'AVAILABLE' })
      .then((res) => setFeatured(res.data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));
  }, []);

  const goToSearch = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (branchId) params.set('branchId', branchId);
    params.set('startDate', startDate);
    params.set('endDate', endDate);
    navigate(`/search?${params.toString()}`);
  };

  const goToCategory = (key) => {
    navigate(`/search?type=${key}`);
  };

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <h1>Rent the Perfect Vehicle for Your Next Journey</h1>
              <p className="lead mt-3">
                Cars, bikes, scooters, buses and more — affordable rentals, trusted vehicles,
                unforgettable journeys.
              </p>
              <div className="d-flex gap-2 mt-4">
                <button className="btn btn-accent btn-lg" onClick={goToSearch}>
                  Search vehicles
                </button>
                <button
                  className="btn btn-outline-brand btn-lg"
                  onClick={() => navigate('/search')}
                >
                  Explore vehicles
                </button>
              </div>
            </div>
            <div className="col-lg-6 text-center d-none d-lg-block">
              <img
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
                alt="Featured rental vehicle"
                className="img-fluid hero-vehicle-img"
                style={{ maxHeight: 320, objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING SEARCH BOX */}
      <div className="container">
        <form className="search-box" onSubmit={goToSearch}>
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Pickup location</label>
              <select
                className="form-select"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              >
                <option value="">Any branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Start date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">End date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Vehicle type</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Any type</option>
                <option value="CAR">Car</option>
                <option value="BIKE">Bike</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-brand w-100">
                Search vehicles
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Browse by vehicle type</h2>
          <p className="section-subtitle">Pick a category to jump straight into matching vehicles.</p>
          <div className="row g-3">
            {CATEGORIES.map((c) => (
              <div className="col-6 col-md-3" key={c.key}>
                <div className="category-card" onClick={() => goToCategory(c.key)}>
                  <img src={getCategoryImage(c.key)} alt={c.title} />
                  <div className="overlay">
                    <span className="emoji">{c.emoji}</span>
                    <h6>{c.title}</h6>
                    <small>{c.desc}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <section className="section bg-soft">
        <div className="container">
          <h2 className="section-title">Featured vehicles</h2>
          <p className="section-subtitle">A snapshot of what's available right now.</p>

          {loadingFeatured && <p className="text-muted">Loading vehicles...</p>}

          <div className="row g-4">
            {featured.map((v) => (
              <div className="col-md-4 col-lg-3" key={v._id}>
                <div className="card vehicle-card h-100">
                  <div className="img-wrap">
                    <VehicleImage vehicle={v} width={500} />
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h6 className="mb-1">
                      {v.brand} {v.model}
                    </h6>
                    <div className="text-muted small mb-2">
                      {v.type} &middot; {v.branchId?.name || v.branchId?.city || 'Branch'}
                    </div>
                    <div className="price mb-2">
                      ₹{v.perDayRate} <small>/ day</small>
                    </div>
                    <span
                      className={`status-badge align-self-start mb-3 ${
                        v.status === 'AVAILABLE' ? 'status-available' : 'status-booked'
                      }`}
                    >
                      {v.status}
                    </span>
                    <div className="d-flex gap-2 mt-auto">
                      <button
                        className="btn btn-outline-secondary btn-sm flex-grow-1"
                        onClick={() => navigate(`/vehicles/${v._id}`)}
                      >
                        View details
                      </button>
                      <button
                        className="btn btn-accent btn-sm flex-grow-1"
                        onClick={() =>
                          navigate(
                            `/vehicles/${v._id}?startDate=${todayISO()}&endDate=${tomorrowISO()}`
                          )
                        }
                      >
                        Rent now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNERS */}
      <section className="section">
        <div className="container">
          <div className="row g-4">
            {PROMOS.map((p) => (
              <div className="col-md-4" key={p.title}>
                <div className="promo-banner">
                  <img src={p.img} alt={p.title} />
                  <div className="promo-overlay" />
                  <div className="promo-content">
                    <h5 className="text-white">{p.title}</h5>
                    <p className="mb-3" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {p.subtitle}
                    </p>
                    <button className="btn btn-accent btn-sm" onClick={() => goToCategory(p.type)}>
                      {p.cta}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section bg-soft">
        <div className="container">
          <h2 className="section-title text-center">How it works</h2>
          <p className="section-subtitle text-center">Four simple steps from search to drive.</p>
          <div className="row g-3">
            {STEPS.map((s) => (
              <div className="col-6 col-md-3" key={s.n}>
                <div className="step-card card h-100">
                  <div className="step-number">{s.n}</div>
                  <div style={{ fontSize: '1.6rem' }}>{s.icon}</div>
                  <h6>{s.title}</h6>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY RENTALHUB */}
      <section className="section">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-5">
              <h2 className="section-title">Why choose RentalHub?</h2>
              <p className="section-subtitle">
                We built RentalHub around the things that actually matter when you rent a
                vehicle: trust, clarity, and speed.
              </p>
              <img
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=700&q=80"
                alt="Why RentalHub"
                className="img-fluid rounded-xl d-none d-lg-block"
              />
            </div>
            <div className="col-lg-7">
              <div className="row">
                {WHY_US.map((w) => (
                  <div className="col-md-6" key={w.title}>
                    <div className="why-item">
                      <div className="icon">{w.icon}</div>
                      <div>
                        <h6 className="mb-1">{w.title}</h6>
                        <p className="text-muted small mb-0">{w.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section bg-soft">
        <div className="container">
          <h2 className="section-title text-center">What our customers say</h2>
          <p className="section-subtitle text-center">
            Demo testimonials for illustration purposes — not real customer reviews.
          </p>
          <div className="row g-4">
            {TESTIMONIALS.map((t) => (
              <div className="col-md-4" key={t.name}>
                <div className="card testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="author">
                    {t.name}
                    <small>{t.location}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
