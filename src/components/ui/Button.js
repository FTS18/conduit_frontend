import React from 'react';

export const Button = ({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    default: 'btn-default',
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    destructive: 'btn-destructive'
  };
  const sizeClasses = {
    sm: 'btn-sm',
    default: 'btn-default-size',
    lg: 'btn-lg'
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          text-decoration: none;
          font-family: inherit;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .btn-default-size {
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
        }

        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }

        .btn-default {
          background: var(--bg-card, #ffffff);
          color: var(--text-main, #111827);
          border: 1px solid var(--border-color, #e5e7eb);
        }

        .btn-default:hover:not(:disabled) {
          background: var(--bg-hover, #f3f4f6);
        }

        .btn-primary {
          background: var(--primary, #3b82f6);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--primary-hover, #2563eb);
        }
        
        @media (prefers-color-scheme: dark) {
          .btn-default {
            background: var(--bg-card, #1f2937);
            color: var(--text-main, #f9fafb);
            border-color: var(--border-color, #374151);
          }
          
          .btn-default:hover:not(:disabled) {
            background: var(--bg-hover, #374151);
          }
        }

        .btn-secondary {
          background: var(--text-secondary);
          color: white;
        }

        .btn-outline {
          background: transparent;
          color: var(--primary);
          border: 1px solid var(--primary);
        }

        .btn-outline:hover:not(:disabled) {
          background: var(--primary);
          color: white;
        }

        .btn-ghost {
          background: transparent;
          color: var(--text-main, #111827);
        }

        .btn-ghost:hover:not(:disabled) {
          background: var(--bg-hover, #f3f4f6);
        }
        
        @media (prefers-color-scheme: dark) {
          .btn-ghost {
            color: var(--text-main, #f9fafb);
          }
          
          .btn-ghost:hover:not(:disabled) {
            background: var(--bg-hover, #374151);
          }
        }

        .btn-destructive {
          background: #dc3545;
          color: white;
        }

        .btn-destructive:hover:not(:disabled) {
          background: #c82333;
        }
      `}</style>
    </button>
  );
};