const mongoose = require('mongoose');

const VEHICLE_STATUSES = ['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'INACTIVE'];

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: { type: String, enum: ['CAR', 'BIKE'], required: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    perDayRate: { type: Number, required: true, min: 0 },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    status: { type: String, enum: VEHICLE_STATUSES, default: 'AVAILABLE' },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

vehicleSchema.index({ branchId: 1 });
vehicleSchema.index({ registrationNumber: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
module.exports.VEHICLE_STATUSES = VEHICLE_STATUSES;
