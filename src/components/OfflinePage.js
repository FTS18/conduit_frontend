import React from 'react';
import OfflineReader from './OfflineReader';

const OfflinePage = () => {
  return (
    <div className="offline-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-12">
            <OfflineReader />
          </div>
        </div>
      </div>
      
      <style>{`
        .offline-page {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .dark-theme .offline-page {
          background: #0d0d0d;
        }

        .container.page {
          padding: 2rem 0;
        }

        @media (max-width: 768px) {
          .container.page {
            padding: 1rem 0;
          }
        }
      `}</style>
    </div>
  );
};

export default OfflinePage;