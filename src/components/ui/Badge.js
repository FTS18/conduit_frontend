import React from 'react';

export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variantClasses = {
    default: 'badge-default',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    destructive: 'badge-destructive',
    outline: 'badge-outline'
  };

  return (
    <span className={`badge ${variantClasses[variant]} ${className}`} {...props}>
      {children}
      
      <style jsx>{`
        .badge {
          display: inline-flex;
          align-items: center;
          border-radius: 9999px;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1;
          white-space: nowrap;
        }

        .badge-default {
          background: var(--primary, #3b82f6);
          color: white;
        }

        .badge-secondary {
          background: var(--bg-hover, #f3f4f6);
          color: var(--text-secondary, #6b7280);
        }

        .badge-success {
          background: #10b981;
          color: white;
        }

        .badge-warning {
          background: #f59e0b;
          color: white;
        }

        .badge-destructive {
          background: #ef4444;
          color: white;
        }

        .badge-outline {
          background: transparent;
          color: var(--text-main, #111827);
          border: 1px solid var(--border-color, #e5e7eb);
        }

        @media (prefers-color-scheme: dark) {
          .badge-secondary {
            background: var(--bg-hover, #374151);
            color: var(--text-secondary, #9ca3af);
          }

          .badge-outline {
            color: var(--text-main, #f9fafb);
            border-color: var(--border-color, #4b5563);
          }
        }
      `}</style>
    </span>
  );
};