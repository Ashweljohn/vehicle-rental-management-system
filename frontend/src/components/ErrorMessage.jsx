import React from 'react';

/**
 * Renders a dismissible-style Bootstrap alert for an error message.
 * Accepts either a plain string or an axios error object and extracts
 * the backend's `message` field where possible.
 */
const ErrorMessage = ({ error }) => {
  if (!error) return null;

  const message =
    typeof error === 'string'
      ? error
      : error?.response?.data?.message || error?.message || 'Something went wrong';

  return (
    <div className="alert alert-danger" role="alert">
      {message}
    </div>
  );
};

export default ErrorMessage;
