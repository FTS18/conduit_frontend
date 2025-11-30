import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
      <style jsx>{`
        .card {
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        @media (prefers-color-scheme: dark) {
          .card {
            background: var(--bg-card, #1f2937);
            border-color: var(--border-color, #374151);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
      <style jsx>{`
        .card-header {
          padding: 1.5rem;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-content ${className}`} {...props}>
      {children}
      <style jsx>{`
        .card-content {
          padding: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`card-title ${className}`} {...props}>
      {children}
      <style jsx>{`
        .card-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-main, #111827);
        }
        
        @media (prefers-color-scheme: dark) {
          .card-title {
            color: var(--text-main, #f9fafb);
          }
        }
      `}</style>
    </h3>
  );
};
