import React from 'react';

export const Avatar = ({ src, alt, size = 'default', className = '', children, ...props }) => {
  const sizeClasses = {
    sm: 'avatar-sm',
    default: 'avatar-default',
    lg: 'avatar-lg',
    xl: 'avatar-xl'
  };

  return (
    <div className={`avatar ${sizeClasses[size]} ${className}`} {...props}>
      {src ? (
        <img src={src} alt={alt} className="avatar-image" />
      ) : (
        <div className="avatar-fallback">
          {children || (alt ? alt.charAt(0).toUpperCase() : '?')}
        </div>
      )}
      
      <style jsx>{`
        .avatar {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          overflow: hidden;
          background: var(--bg-hover, #f3f4f6);
          border: 2px solid var(--border-color, #e5e7eb);
        }

        .avatar-sm {
          width: 32px;
          height: 32px;
        }

        .avatar-default {
          width: 48px;
          height: 48px;
        }

        .avatar-lg {
          width: 80px;
          height: 80px;
        }

        .avatar-xl {
          width: 120px;
          height: 120px;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary, #3b82f6);
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .avatar-sm .avatar-fallback {
          font-size: 0.75rem;
        }

        .avatar-lg .avatar-fallback {
          font-size: 1.25rem;
        }

        .avatar-xl .avatar-fallback {
          font-size: 1.75rem;
        }

        @media (prefers-color-scheme: dark) {
          .avatar {
            background: var(--bg-hover, #374151);
            border-color: var(--border-color, #4b5563);
          }
        }
      `}</style>
    </div>
  );
};