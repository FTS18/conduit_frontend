import React from 'react';

export const ArticleSkeleton = () => (
  <div className="article-preview" style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div className="skeleton skeleton-circle" style={{ width: '40px', height: '40px' }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '80px', height: '12px' }} />
      </div>
    </div>

    <div className="skeleton" style={{ width: '80%', height: '24px', marginBottom: '12px' }} />
    <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '8px' }} />
    <div className="skeleton" style={{ width: '90%', height: '16px', marginBottom: '16px' }} />

    <div style={{ display: 'flex', gap: '8px' }}>
      <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '12px' }} />
      <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
      <div className="skeleton" style={{ width: '70px', height: '24px', borderRadius: '12px' }} />
    </div>

    <style jsx>{`
      .skeleton {
        background: linear-gradient(
          90deg,
          #f0f0f0 0%,
          #f8f8f8 50%,
          #f0f0f0 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
      }

      .skeleton-circle {
        border-radius: 50%;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .dark-theme .skeleton {
        background: linear-gradient(
          90deg,
          #2a2a2a 0%,
          #333333 50%,
          #2a2a2a 100%
        );
        background-size: 200% 100%;
      }
    `}</style>
  </div>
);

export const ProfileSkeleton = () => (
  <div style={{ padding: '24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
      <div className="skeleton skeleton-circle" style={{ width: '80px', height: '80px' }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '200px', height: '24px', marginBottom: '12px' }} />
        <div className="skeleton" style={{ width: '300px', height: '16px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '150px', height: '14px' }} />
      </div>
    </div>

    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
      <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '8px' }} />
      <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '8px' }} />
    </div>

    <style jsx>{`
      .skeleton {
        background: linear-gradient(
          90deg,
          #f0f0f0 0%,
          #f8f8f8 50%,
          #f0f0f0 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
      }

      .skeleton-circle {
        border-radius: 50%;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .dark-theme .skeleton {
        background: linear-gradient(
          90deg,
          #2a2a2a 0%,
          #333333 50%,
          #2a2a2a 100%
        );
        background-size: 200% 100%;
      }
    `}</style>
  </div>
);

export const CommentSkeleton = () => (
  <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
    <div style={{ display: 'flex', gap: '12px' }}>
      <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '12px' }} />
        <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '80%', height: '14px' }} />
      </div>
    </div>

    <style jsx>{`
      .skeleton {
        background: linear-gradient(
          90deg,
          #f0f0f0 0%,
          #f8f8f8 50%,
          #f0f0f0 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
      }

      .skeleton-circle {
        border-radius: 50%;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .dark-theme .skeleton {
        background: linear-gradient(
          90deg,
          #2a2a2a 0%,
          #333333 50%,
          #2a2a2a 100%
        );
        background-size: 200% 100%;
      }
    `}</style>
  </div>
);

export const ListSkeleton = ({ count = 3, type = 'article' }) => {
  const SkeletonComponent = type === 'article' ? ArticleSkeleton :
    type === 'profile' ? ProfileSkeleton :
      CommentSkeleton;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </>
  );
};

export default ListSkeleton;
