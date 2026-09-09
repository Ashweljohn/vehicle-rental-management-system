const mongoose = require('mongoose');

// Valid workflow: RESERVED -> PICKED_UP -> RETURNED
// Cancellation: RESERVED -> CANCELLED
const BOOKING_STATUSES = ['RESERVED', 'PICKED_UP', 'RETURNED', 'CANCELLED'];

const addOnLineSchema = new mongoose.Schema(
  {
    addOnId: { type: mongoose.Schema.Types.ObjectId, ref: 'AddOn', required: true },
    name: { type: String, required: true }, // snapshot at time of booking
    price: { type: Number, required: true }, // snapshot at time of booking
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    numberOfDays: { type: Number, required: true, min: 1 },
    baseAmount: { type: Number, required: true, min: 0 },
    addOns: { type: [addOnLineSchema], default: [] },
    addOnAmount: { type: Number, required: true, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: BOOKING_STATUSES, default: 'RESERVED' },
    cancellationCharge: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bookingSchema.index({ customerId: 1 });
bookingSchema.index({ vehicleId: 1 });
bookingSchema.index({ branchId: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.BOOKING_STATUSES = BOOKING_STATUSES;
