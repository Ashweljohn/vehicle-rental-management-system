const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stage: { type: String, enum: ['PICKUP', 'RETURN'], required: true },
    odometer: { type: Number, required: true, min: 0 },
    fuelLevel: { type: Number, required: true, min: 0, max: 100 }, // percentage
    conditionNotes: { type: String, default: '' },
    damageNotes: { type: String, default: '' },
    extraCharges: { type: Number, default: 0, min: 0 }, // only relevant for RETURN stage
  },
  { timestamps: true }
);

inspectionSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Inspection', inspectionSchema);
