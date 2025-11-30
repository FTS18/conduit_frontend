import React from 'react';
import RecommendedProfiles from './RecommendedProfiles';

class GlobalSidebar extends React.Component {
  render() {
    const { currentUser } = this.props;

    return (
      <div className="global-sidebar">
        <RecommendedProfiles currentUser={currentUser} showOnlyOnHome={true} />

        <style>{`
          .global-sidebar {
            position: fixed;
            top: 56px;
            right: 0;
            width: 360px;
            height: calc(100vh - 56px);
            overflow-y: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
            background: var(--bg-card);
            border-left: 1px solid var(--border-color);
            padding: 1.5rem;
            box-sizing: border-box;
            z-index: 100;
          }

          .global-sidebar::-webkit-scrollbar {
            display: none;
          }

          .sidebar-card {
            background: var(--bg-hover);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            margin-bottom: 1.5rem;
            overflow: hidden;
            transition: all 0.2s ease;
          }

          .sidebar-card:hover {
            box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
            border-color: var(--primary);
          }

          @media (max-width: 1024px) {
            .global-sidebar {
              display: none;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default GlobalSidebar;
