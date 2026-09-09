import React from 'react';

const Loading = ({ label = 'Loading...' }) => (
  <div className="d-flex flex-column align-items-center justify-content-center py-5">
    <div className="spinner-border text-brand" role="status" style={{ color: '#2f6f5e' }}>
      <span className="visually-hidden">{label}</span>
    </div>
    <div className="mt-2 text-muted small">{label}</div>
  </div>
);

export default Loading;
