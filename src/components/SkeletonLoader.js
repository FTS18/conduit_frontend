import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="skeleton-loader">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton-item">
          <div className="skeleton-header">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-info">
              <div className="skeleton-line skeleton-name"></div>
              <div className="skeleton-line skeleton-date"></div>
            </div>
          </div>
          <div className="skeleton-title"></div>
          <div className="skeleton-description">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
          <div className="skeleton-footer">
            <div className="skeleton-line skeleton-tag"></div>
            <div className="skeleton-line skeleton-tag"></div>
          </div>
        </div>
      ))}

      <style>{`
        .skeleton-loader {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .skeleton-item {
          background: white;
          border-left: 4px solid #e1e4e8;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border-radius: 0;
        }

        .dark-theme .skeleton-item {
          background: #1a1a1a;
          border-left-color: #333;
        }

        .skeleton-header {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .skeleton-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(90deg, #e1e4e8 25%, #f0f0f0 50%, #e1e4e8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          flex-shrink: 0;
        }

        .dark-theme .skeleton-avatar {
          background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
          background-size: 200% 100%;
        }

        .skeleton-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .skeleton-name {
          width: 120px;
          height: 16px;
        }

        .skeleton-date {
          width: 80px;
          height: 12px;
        }

        .skeleton-title {
          height: 24px;
          margin-bottom: 0.75rem;
          background: linear-gradient(90deg, #e1e4e8 25%, #f0f0f0 50%, #e1e4e8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .dark-theme .skeleton-title {
          background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
          background-size: 200% 100%;
        }

        .skeleton-description {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .skeleton-line {
          height: 14px;
          background: linear-gradient(90deg, #e1e4e8 25%, #f0f0f0 50%, #e1e4e8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .dark-theme .skeleton-line {
          background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
          background-size: 200% 100%;
        }

        .skeleton-footer {
          display: flex;
          gap: 1rem;
        }

        .skeleton-tag {
          width: 80px;
          height: 14px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .skeleton-item {
            padding: 1.25rem;
            margin-bottom: 0.75rem;
          }

          .skeleton-title {
            height: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default SkeletonLoader;
