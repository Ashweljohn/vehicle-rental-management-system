import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import vehicleService from '../services/vehicleService';
import bookingService from '../services/bookingService';
import VehicleImage from '../components/VehicleImage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const calcDays = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

const CreateBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const vehicleId = searchParams.get('vehicleId');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  const [vehicle, setVehicle] = useState(null);
  const [addOns, setAddOns] = useState([]);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      vehicleService.getVehicleById(vehicleId),
      vehicleService.getAddOns({ activeOnly: 'true' }),
    ])
      .then(([vRes, aRes]) => {
        setVehicle(vRes.data);
        setAddOns(aRes.data);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const toggleAddOn = (id) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const numberOfDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return calcDays(startDate, endDate);
  }, [startDate, endDate]);

  // NOTE: this is a client-side preview only, purely so the person can see
  // an estimate while they pick dates/add-ons. The server independently
  // recalculates numberOfDays, baseAmount, addOnAmount and totalAmount on
  // POST /api/bookings and that server-computed value is the one that's
  // actually saved - the frontend's estimate is never sent as a trusted price.
  const baseAmount = vehicle ? vehicle.perDayRate * numberOfDays : 0;
  const addOnAmount = addOns
    .filter((a) => selectedAddOns.includes(a._id))
    .reduce((sum, a) => sum + a.price, 0);
  const totalAmount = baseAmount + addOnAmount;

  const handleConfirm = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await bookingService.createBooking({
        vehicleId,
        startDate,
        endDate,
        addOnIds: selectedAddOns,
      });
      navigate(`/customer/bookings`, { state: { justBooked: res.data._id } });
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (!vehicle)
    return (
      <div className="container section-sm">
        <ErrorMessage error={error} />
      </div>
    );

  return (
    <div className="container section-sm">
      <h2 className="section-title">Confirm your booking</h2>
      <ErrorMessage error={error} />

      <div className="row g-4">
        <div className="col-md-5">
          <div className="card p-3">
            <div className="rounded-xl overflow-hidden mb-3" style={{ height: 200 }}>
              <VehicleImage
                vehicle={vehicle}
                width={600}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h5 className="mb-1">
              {vehicle.brand} {vehicle.model}
            </h5>
            <p className="text-muted mb-2">{vehicle.type}</p>
            <p className="text-muted small mb-0">
              {vehicle.branchId?.name}, {vehicle.branchId?.city}
            </p>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card p-4">
            <h5 className="mb-3">Booking summary</h5>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Start date</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">End date</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <h6>Add-ons</h6>
            {addOns.map((a) => (
              <div className="form-check mb-1" key={a._id}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`addon-${a._id}`}
                  checked={selectedAddOns.includes(a._id)}
                  onChange={() => toggleAddOn(a._id)}
                />
                <label className="form-check-label" htmlFor={`addon-${a._id}`}>
                  {a.name} (+₹{a.price}) &mdash; <span className="text-muted">{a.description}</span>
                </label>
              </div>
            ))}

            <hr />

            <div className="d-flex justify-content-between">
              <span>Number of days</span>
              <span>{numberOfDays}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Base amount</span>
              <span>₹{baseAmount}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Add-on amount</span>
              <span>₹{addOnAmount}</span>
            </div>
            <div className="d-flex justify-content-between fw-bold fs-4 mt-2 text-accent">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>

            <button
              className="btn btn-accent btn-lg mt-4"
              disabled={submitting || !startDate || !endDate}
              onClick={handleConfirm}
            >
              {submitting ? 'Booking...' : 'Confirm booking'}
            </button>
            <p className="text-muted small mt-2 mb-0">
              Final price and availability are always validated by the server at confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;
