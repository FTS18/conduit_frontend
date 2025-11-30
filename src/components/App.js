import agent from '../agent';
import MinimalHeader from './MinimalHeader';
import Sidebar from './Sidebar';
import GlobalSidebar from './GlobalSidebar';
import Notifications from './Notifications';
import React from 'react';
import { connect } from 'react-redux';
import { APP_LOAD, REDIRECT } from '../constants/actionTypes';
import { Route, Switch, Link, withRouter } from 'react-router-dom';
import Article from '../components/Article';
import Editor from '../components/Editor';
import Home from '../components/Home';
import Login from '../components/Login';
import Profile from '../components/Profile';
import ReadingList from '../components/ReadingList';
import Register from '../components/Register';
import Settings from '../components/Settings';
import { store } from '../store';
import { push } from 'react-router-redux';

const mapStateToProps = state => {
  return {
    appLoaded: state.common.appLoaded,
    appName: state.common.appName,
    currentUser: state.common.currentUser,
    redirectTo: state.common.redirectTo
  }
};

const mapDispatchToProps = dispatch => ({
  onLoad: (payload, token) =>
    dispatch({ type: APP_LOAD, payload, token, skipTracking: true }),
  onRedirect: () =>
    dispatch({ type: REDIRECT })
});

class App extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.redirectTo) {
      store.dispatch(push(nextProps.redirectTo));
      this.props.onRedirect();
    }
  }

  componentWillMount() {
    const token = window.localStorage.getItem('jwt');
    if (token) {
      agent.setToken(token);
    }

    this.props.onLoad(token ? agent.Auth.current() : null, token);
  }

  isActive = (path) => {
    if (path === '/' && this.props.location.pathname === '/') return true;
    if (path !== '/' && this.props.location.pathname.startsWith(path)) return true;
    return false;
  };

  render() {
    if (this.props.appLoaded) {
      return (
        <div className="app-layout">
          <MinimalHeader
            appName={this.props.appName}
            currentUser={this.props.currentUser} />
          <Sidebar />
          <GlobalSidebar currentUser={this.props.currentUser} />
          <div className="main-content">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/editor/:slug" component={Editor} />
              <Route path="/editor" component={Editor} />
              <Route path="/article/:id" component={Article} />
              <Route path="/reading-list" component={ReadingList} />
              <Route path="/settings" component={Settings} />
              <Route path="/@:username/:tab" component={Profile} />
              <Route path="/@:username" component={Profile} />
              <Route path="/notifications" component={Notifications} />
            </Switch>
          </div>

          <div className="mobile-bottom-nav">
            <Link to="/" className={`nav-link ${this.isActive('/') ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Home</span>
            </Link>
            <Link to="/reading-list" className={`nav-link ${this.isActive('/reading-list') ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Bookmarks</span>
            </Link>
            {this.props.currentUser && (
              <Link to="/editor" className={`nav-link ${this.isActive('/editor') ? 'active' : ''}`}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Write</span>
              </Link>
            )}
            <Link to="/notifications" className={`nav-link ${this.isActive('/notifications') ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span>Notifications</span>
            </Link>
            {this.props.currentUser && (
              <Link to={`/@${this.props.currentUser.username}`} className={`nav-link ${this.props.location.pathname === `/@${this.props.currentUser.username}` ? 'active' : ''}`}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Profile</span>
              </Link>
            )}
          </div>

          <style>{`
            .app-layout {
              display: flex;
              min-height: 100vh;
              width: 100%;
              overflow-x: hidden;
            }

            .main-content {
              flex: 1;
              margin-left: 280px;
              margin-right: 360px;
              margin-top: 64px;
              min-height: calc(100vh - 64px);
              width: calc(100% - 640px);
              max-width: calc(100% - 640px);
              overflow-x: hidden;
            }

            @media (max-width: 1024px) {
              .main-content {
                margin-right: 0;
                width: calc(100% - 280px);
                max-width: calc(100% - 280px);
              }
            }

            @media (max-width: 768px) {
              .main-content {
                margin-left: 0;
                margin-top: 56px;
                width: 100%;
                max-width: 100%;
                padding-bottom: 60px;
              }
            }

            .mobile-bottom-nav {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              height: 60px;
              background: var(--bg-card);
              border-top: 1px solid var(--border-color);
              display: none;
              z-index: 999;
            }

            @media (max-width: 768px) {
              .mobile-bottom-nav {
                display: flex;
                justify-content: space-around;
                align-items: center;
              }

              .nav-link {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                flex: 1;
                height: 100%;
                color: #777777;
                text-decoration: none;
                transition: all 0.2s;
                gap: 0.15rem;
                border-right: 1px solid var(--border-color);
                padding: 0;
                border-radius: 0;
              }

              .nav-link:last-child {
                border-right: none;
              }

              .nav-link span {
                font-size: 0.6rem;
                font-weight: 500;
              }

              .nav-link:hover {
                color: #999999;
              }

              .nav-link.active {
                background: var(--primary);
                color: #ffffff;
              }

              .nav-link.active svg {
                stroke: #ffffff;
              }

              .nav-link.active span {
                color: #ffffff;
              }



              .nav-icon {
                width: 24px;
                height: 24px;
              }
            }

            body.font-small {
              font-size: 14px;
            }

            body.font-medium {
              font-size: 16px;
            }

            body.font-large {
              font-size: 18px;
            }

            body {
              background: var(--bg-body);
              color: var(--text-main);
            }

            .pagination {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
              justify-content: center;
              padding: 1.5rem 0;
              list-style: none;
              margin: 0;
            }

            .page-item {
              display: inline-block;
            }

            .page-link {
              display: flex;
              align-items: center;
              justify-content: center;
              min-width: 44px;
              min-height: 44px;
              padding: 0.5rem 0.75rem;
              border: 2px solid var(--border-color);
              border-radius: 50px;
              color: var(--text-secondary);
              text-decoration: none;
              transition: all 0.2s;
              font-weight: 600;
            }

            .page-link:hover {
              background: var(--bg-hover);
              border-color: var(--primary);
              color: var(--primary);
              box-shadow: 0 2px 4px rgba(0, 102, 204, 0.2);
            }

            .page-item.active .page-link {
              background: var(--primary);
              color: white;
              border-color: var(--primary);
            }

            @media (max-width: 768px) {
              .pagination {
                gap: 0.5rem;
                padding: 1.25rem 1rem;
              }

              .page-link {
                min-width: 48px;
                min-height: 48px;
                padding: 0.75rem;
                font-size: 1rem;
                border-radius: 50px;
                font-weight: 600;
              }
              
              .page-link:active {
                transform: scale(0.95);
                transition: transform 0.1s;
              }
            }
          `}</style>
        </div>
      );
    }
    return (
      <div className="app-layout">
        <MinimalHeader
          appName={this.props.appName}
          currentUser={this.props.currentUser} />
        <Sidebar />
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
