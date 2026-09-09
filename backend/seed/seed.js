/**
 * Seed script: populates the database with demo data for local
 * development, Postman testing, and the viva/demo.
 *
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Branch = require('../models/Branch');
const Vehicle = require('../models/Vehicle');
const AddOn = require('../models/AddOn');
const Booking = require('../models/Booking');
const Inspection = require('../models/Inspection');

const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Vehicle.deleteMany({}),
    AddOn.deleteMany({}),
    Booking.deleteMany({}),
    Inspection.deleteMany({}),
  ]);

  console.log('Creating branches...');
  const branches = await Branch.insertMany([
    { name: 'MG Road Branch', city: 'Bengaluru', address: '12 MG Road, Bengaluru', phone: '9876543210', status: 'ACTIVE' },
    { name: 'Andheri Branch', city: 'Mumbai', address: '45 Andheri West, Mumbai', phone: '9876543211', status: 'ACTIVE' },
    { name: 'Connaught Place Branch', city: 'Delhi', address: '7 Connaught Place, Delhi', phone: '9876543212', status: 'ACTIVE' },
  ]);
  const [bengaluru, mumbai, delhi] = branches;

  console.log('Creating users (admin, staff, customer)...');
  const [adminHash, staffHash, customerHash] = await Promise.all([
    bcrypt.hash('Admin@123', 10),
    bcrypt.hash('Staff@123', 10),
    bcrypt.hash('Customer@123', 10),
  ]);

  await User.create([
    {
      name: 'System Admin',
      email: 'admin@rental.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      phone: '9000000001',
      isActive: true,
    },
    {
      name: 'Branch Staff',
      email: 'staff@rental.com',
      passwordHash: staffHash,
      role: 'BRANCH_STAFF',
      branchId: bengaluru._id,
      phone: '9000000002',
      isActive: true,
    },
    {
      name: 'Demo Customer',
      email: 'customer@rental.com',
      passwordHash: customerHash,
      role: 'CUSTOMER',
      phone: '9000000003',
      isActive: true,
    },
  ]);

  console.log('Creating vehicles...');
  await Vehicle.insertMany([
    { registrationNumber: 'KA01AB1234', type: 'CAR', brand: 'Toyota', model: 'Innova', year: 2022, perDayRate: 2500, branchId: bengaluru._id, status: 'AVAILABLE', image: '' },
    { registrationNumber: 'KA01AB1235', type: 'CAR', brand: 'Hyundai', model: 'Creta', year: 2023, perDayRate: 2200, branchId: bengaluru._id, status: 'AVAILABLE', image: '' },
    { registrationNumber: 'KA01AB1236', type: 'CAR', brand: 'Maruti', model: 'Swift', year: 2021, perDayRate: 1500, branchId: bengaluru._id, status: 'AVAILABLE', image: '' },
    { registrationNumber: 'MH02CD5671', type: 'CAR', brand: 'Honda', model: 'City', year: 2022, perDayRate: 1900, branchId: mumbai._id, status: 'AVAILABLE', image: '' },
    { registrationNumber: 'MH02CD5672', type: 'CAR', brand: 'Tata', model: 'Nexon', year: 2023, perDayRate: 1800, branchId: mumbai._id, status: 'AVAILABLE', image: '' },
    { registrationNumber: 'MH02CD5673', type: 'BIKE', brand: 'Royal Enfield', model: 'Classic 350', year: 2022, perDayRate: 900, branchId: mumbai._id, status: 'AVAILABLE', image: '' },
    { registrationNumber: 'DL03EF9101', type: 'BIKE', brand: 'Honda', model: 'Activa', year: 2023, perDayRate: 500, branchId: delhi._id, status: 'AVAILABLE', image: '' },
    { registrationNumber: 'DL03EF9102', type: 'BIKE', brand: 'Yamaha', model: 'FZ', year: 2021, perDayRate: 700, branchId: delhi._id, status: 'AVAILABLE', image: '' },
    { registrationNumber: 'DL03EF9103', type: 'CAR', brand: 'Maruti', model: 'Swift', year: 2020, perDayRate: 1400, branchId: delhi._id, status: 'MAINTENANCE', image: '' },
    { registrationNumber: 'KA01AB1237', type: 'CAR', brand: 'Toyota', model: 'Innova', year: 2020, perDayRate: 2300, branchId: bengaluru._id, status: 'AVAILABLE', image: '' },
  ]);

  console.log('Creating add-ons...');
  await AddOn.insertMany([
    { name: 'Insurance', description: 'Comprehensive damage & theft insurance for the rental period', price: 300, isActive: true },
    { name: 'GPS', description: 'In-car GPS navigation device', price: 150, isActive: true },
    { name: 'Additional Driver', description: 'Register a second authorized driver for the rental', price: 200, isActive: true },
  ]);

  console.log('Seed complete!');
  console.log('----------------------------------------');
  console.log('Demo credentials:');
  console.log('Admin:    admin@rental.com / Admin@123');
  console.log('Staff:    staff@rental.com / Staff@123');
  console.log('Customer: customer@rental.com / Customer@123');
  console.log('----------------------------------------');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
