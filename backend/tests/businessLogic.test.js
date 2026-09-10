/**
 * Automated Unit Test Suite for Vehicle Rental Management System
 * Author: Anushka (Backend & Business Logic)
 * 
 * Tests the core business logic functions:
 * 1. Pricing Engine (calculateBookingPrice)
 * 2. Cancellation Policy Engine (calculateCancellationCharge)
 * 3. Date Range Overlap & Conflict Engine (rangesOverlap, isValidDateRange)
 * 4. Booking Workflow Status Transitions (assertValidTransition)
 */

const assert = require('assert');
const { calculateBookingPrice } = require('../services/pricingService');
const { calculateCancellationCharge } = require('../services/cancellationService');
const { rangesOverlap, isValidDateRange, calculateNumberOfDays } = require('../utils/dateUtils');
const { assertValidTransition } = require('../services/bookingService');

let passedTests = 0;
let failedTests = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${testName}`);
    console.error(`    Error: ${err.message}`);
    failedTests++;
  }
}

console.log('========================================================');
console.log('Running Vehicle Rental Business Logic Unit Tests');
console.log('========================================================\n');

// ----------------------------------------------------
// 1. Pricing Engine Tests
// ----------------------------------------------------
console.log('[Module 1] Pricing Service Tests:');

runTest('Calculates base price accurately for multiple days', () => {
  const result = calculateBookingPrice(1500, '2026-09-15', '2026-09-18');
  assert.strictEqual(result.numberOfDays, 3);
  assert.strictEqual(result.baseAmount, 4500);
  assert.strictEqual(result.addOnAmount, 0);
  assert.strictEqual(result.totalAmount, 4500);
});

runTest('Adds active add-ons correctly to totalAmount', () => {
  const addOns = [
    { name: 'Insurance', price: 300 },
    { name: 'GPS', price: 150 },
  ];
  const result = calculateBookingPrice(2000, '2026-09-15', '2026-09-17', addOns);
  assert.strictEqual(result.numberOfDays, 2);
  assert.strictEqual(result.baseAmount, 4000);
  assert.strictEqual(result.addOnAmount, 450);
  assert.strictEqual(result.totalAmount, 4450);
});

runTest('Enforces minimum 1 day rental calculation', () => {
  const result = calculateBookingPrice(1000, '2026-09-15T10:00:00Z', '2026-09-15T12:00:00Z');
  assert.strictEqual(result.numberOfDays, 1);
  assert.strictEqual(result.totalAmount, 1000);
});

// ----------------------------------------------------
// 2. Cancellation Policy Engine Tests
// ----------------------------------------------------
console.log('\n[Module 2] Cancellation Policy Tests:');

runTest('Full refund (0% charge) when cancelled > 48 hours prior', () => {
  const now = new Date('2026-09-10T10:00:00Z');
  const booking = {
    status: 'RESERVED',
    startDate: new Date('2026-09-15T10:00:00Z'), // 120 hours away
    totalAmount: 5000,
  };
  const result = calculateCancellationCharge(booking, now);
  assert.strictEqual(result.chargePercentage, 0);
  assert.strictEqual(result.cancellationCharge, 0);
  assert.strictEqual(result.refundAmount, 5000);
});

runTest('25% charge applied when cancelled between 24 and 48 hours prior', () => {
  const now = new Date('2026-09-14T00:00:00Z');
  const booking = {
    status: 'RESERVED',
    startDate: new Date('2026-09-15T10:00:00Z'), // 34 hours away
    totalAmount: 4000,
  };
  const result = calculateCancellationCharge(booking, now);
  assert.strictEqual(result.chargePercentage, 25);
  assert.strictEqual(result.cancellationCharge, 1000);
  assert.strictEqual(result.refundAmount, 3000);
});

runTest('50% charge applied when cancelled < 24 hours prior', () => {
  const now = new Date('2026-09-15T00:00:00Z');
  const booking = {
    status: 'RESERVED',
    startDate: new Date('2026-09-15T10:00:00Z'), // 10 hours away
    totalAmount: 3000,
  };
  const result = calculateCancellationCharge(booking, now);
  assert.strictEqual(result.chargePercentage, 50);
  assert.strictEqual(result.cancellationCharge, 1500);
  assert.strictEqual(result.refundAmount, 1500);
});

runTest('Rejects cancellation when booking is already PICKED_UP', () => {
  const booking = {
    status: 'PICKED_UP',
    startDate: new Date('2026-09-15T10:00:00Z'),
    totalAmount: 3000,
  };
  assert.throws(
    () => calculateCancellationCharge(booking),
    (err) => err.errorCode === 'CANCELLATION_NOT_ALLOWED'
  );
});

// ----------------------------------------------------
// 3. Date Overlap & Conflict Logic Tests
// ----------------------------------------------------
console.log('\n[Module 3] Date Overlap & Availability Logic Tests:');

runTest('Identifies overlapping date ranges correctly', () => {
  // Existing booking: Sep 15 - Sep 20
  // Requested: Sep 18 - Sep 22 (overlaps on 18-20)
  assert.strictEqual(
    rangesOverlap('2026-09-15', '2026-09-20', '2026-09-18', '2026-09-22'),
    true
  );
});

runTest('Allows non-overlapping date ranges', () => {
  // Existing: Sep 10 - Sep 14
  // Requested: Sep 15 - Sep 18
  assert.strictEqual(
    rangesOverlap('2026-09-10', '2026-09-14', '2026-09-15', '2026-09-18'),
    false
  );
});

runTest('Abutting/touching boundaries do not conflict', () => {
  // Existing ends at Sep 15 10:00, New starts at Sep 15 10:00
  assert.strictEqual(
    rangesOverlap(
      '2026-09-10T10:00:00Z',
      '2026-09-15T10:00:00Z',
      '2026-09-15T10:00:00Z',
      '2026-09-20T10:00:00Z'
    ),
    false
  );
});

runTest('Validates date range order (start must be before end)', () => {
  assert.strictEqual(isValidDateRange('2026-09-15', '2026-09-20'), true);
  assert.strictEqual(isValidDateRange('2026-09-20', '2026-09-15'), false);
  assert.strictEqual(isValidDateRange('2026-09-15', '2026-09-15'), false);
});

// ----------------------------------------------------
// 4. Booking Workflow Status Transition Tests
// ----------------------------------------------------
console.log('\n[Module 4] Status Transition Workflow Tests:');

runTest('Allows valid lifecycle transitions (RESERVED -> PICKED_UP -> RETURNED)', () => {
  assert.doesNotThrow(() => assertValidTransition('RESERVED', 'PICKED_UP'));
  assert.doesNotThrow(() => assertValidTransition('PICKED_UP', 'RETURNED'));
  assert.doesNotThrow(() => assertValidTransition('RESERVED', 'CANCELLED'));
});

runTest('Rejects invalid status transitions (e.g. RETURNED -> PICKED_UP)', () => {
  assert.throws(
    () => assertValidTransition('RETURNED', 'PICKED_UP'),
    (err) => err.errorCode === 'INVALID_STATUS_TRANSITION'
  );
  assert.throws(
    () => assertValidTransition('CANCELLED', 'PICKED_UP'),
    (err) => err.errorCode === 'INVALID_STATUS_TRANSITION'
  );
  assert.throws(
    () => assertValidTransition('PICKED_UP', 'CANCELLED'),
    (err) => err.errorCode === 'INVALID_STATUS_TRANSITION'
  );
});

// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log('\n========================================================');
console.log(`Test Execution Summary: ${passedTests} Passed, ${failedTests} Failed`);
console.log('========================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
