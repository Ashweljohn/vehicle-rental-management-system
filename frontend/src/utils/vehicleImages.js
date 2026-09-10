/**
 * Vehicle Image Resolver
 *
 * Priority:
 * 1. Image stored in database
 * 2. Exact brand + model image
 * 3. Type-level fallback
 * 4. Generic fallback
 */

const MODEL_IMAGE_MAP = {
  // =========================
  // CARS
  // =========================

  'toyota innova':
    '/images/vehicles/toyota-innova.jpg',

  'hyundai creta':
    '/images/vehicles/hyundai-creta.jpg',

  'maruti swift':
    '/images/vehicles/maruti-swift.jpg',

  'honda city':
    '/images/vehicles/honda-city.jpg',

  'tata nexon':
    '/images/vehicles/tata-nexon.jpg',

  'mahindra thar':
    '/images/vehicles/mahindra-thar.jpg',

  'mg hector':
    '/images/vehicles/mg-hector.jpg',


  // =========================
  // BIKES
  // =========================

  'royal enfield classic':
    '/images/vehicles/royal-enfield-classic.jpg',

  'royal enfield classic 350':
    '/images/vehicles/royal-enfield-classic.jpg',

  'royal enfield hunter':
    '/images/vehicles/royal-enfield-hunter.jpg',

  'yamaha fz':
    '/images/vehicles/yamaha-fz.jpg',

  'ktm duke':
    '/images/vehicles/ktm-duke.jpg',

  'honda shine':
    '/images/vehicles/honda-shine.jpg',


  // =========================
  // SCOOTERS
  // =========================

  'honda activa':
    '/images/vehicles/honda-activa.jpg',

  'tvs jupiter':
    '/images/vehicles/tvs-jupiter.jpg',

  'suzuki access':
    '/images/vehicles/suzuki-access.jpg',


  // =========================
  // VANS
  // =========================

  'force traveller':
    '/images/vehicles/force-traveller.jpg',

  'toyota hiace':
    '/images/vehicles/toyota-hiace.jpg',

  'maruti eeco':
    '/images/vehicles/maruti-eeco.jpg',


  // =========================
  // TRUCKS
  // =========================

  'tata ace':
    '/images/vehicles/tata-ace.jpg',
};


// ======================================================
// TYPE FALLBACKS
// ======================================================
//
// These use images you already have, so you don't need
// to create separate fallback files.
//

const TYPE_IMAGE_MAP = {
  CAR:
    '/images/vehicles/toyota-innova.jpg',

  BIKE:
    '/images/vehicles/royal-enfield-classic.jpg',

  SCOOTER:
    '/images/vehicles/honda-activa.jpg',

  VAN:
    '/images/vehicles/force-traveller.jpg',

  TRUCK:
    '/images/vehicles/tata-ace.jpg',

  BUS:
    '/images/vehicles/force-traveller.jpg',

  AUTO:
    '/images/vehicles/honda-activa.jpg',

  LUXURY:
    '/images/vehicles/toyota-innova.jpg',
};


// Final fallback
const GENERIC_FALLBACK =
  '/images/vehicles/toyota-innova.jpg';


// ======================================================
// NORMALIZE
// ======================================================

const normalize = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');


// ======================================================
// GET VEHICLE IMAGE
// ======================================================

export const getVehicleImage = (
  vehicle = {},
  width = 800
) => {

  // --------------------------------------------------
  // 1. Database image
  // --------------------------------------------------

  if (
    typeof vehicle.image === 'string' &&
    vehicle.image.trim() !== ''
  ) {
    return vehicle.image;
  }


  // --------------------------------------------------
  // 2. Exact brand + model
  // --------------------------------------------------

  const brand = normalize(vehicle.brand);
  const model = normalize(vehicle.model);

  const fullKey = `${brand} ${model}`.trim();

  if (MODEL_IMAGE_MAP[fullKey]) {
    return MODEL_IMAGE_MAP[fullKey];
  }


  // --------------------------------------------------
  // 3. Type fallback
  // --------------------------------------------------

  const type = normalize(vehicle.type).toUpperCase();

  if (TYPE_IMAGE_MAP[type]) {
    return TYPE_IMAGE_MAP[type];
  }


  // --------------------------------------------------
  // 4. Generic fallback
  // --------------------------------------------------

  return GENERIC_FALLBACK;
};


// ======================================================
// CATEGORY IMAGE
// ======================================================

export const getCategoryImage = (
  category,
  width = 600
) => {

  const key = normalize(category).toUpperCase();

  return TYPE_IMAGE_MAP[key] || GENERIC_FALLBACK;
};


export default {
  getVehicleImage,
  getCategoryImage,
};