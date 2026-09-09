require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const branchRoutes = require('./routes/branchRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const addonRoutes = require('./routes/addonRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(mongoSanitize()); // strips $ and . from request data to prevent NoSQL injection
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', data: { uptime: process.uptime() } });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', bookingRoutes.customerHistoryRouter);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/addons', addonRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/users', userRoutes);

// --- 404 + centralized error handling ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Vehicle Rental API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

// Prevent unhandled promise rejections from silently crashing the server.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

start();

module.exports = app;
