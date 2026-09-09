import React, { useState } from 'react';
import { getVehicleImage } from '../utils/vehicleImages';

const GENERIC_FALLBACK =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';

/**
 * Renders a vehicle image using the shared resolver, and silently swaps
 * to a generic fallback if the resolved URL ever fails to load (e.g. a
 * user-supplied `image` URL that is broken).
 */
const VehicleImage = ({ vehicle, className = '', alt, width = 800, style }) => {
  const [src, setSrc] = useState(() => getVehicleImage(vehicle, width));
  const [failedOnce, setFailedOnce] = useState(false);

  const handleError = () => {
    if (!failedOnce) {
      setFailedOnce(true);
      setSrc(GENERIC_FALLBACK);
    }
  };

  return (
    <img
      src={src}
      onError={handleError}
      className={className}
      style={style}
      alt={alt || `${vehicle?.brand || ''} ${vehicle?.model || ''}`.trim() || 'Vehicle'}
      loading="lazy"
    />
  );
};

export default VehicleImage;
