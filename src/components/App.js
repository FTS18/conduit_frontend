import agent from '../agent';
import Header from './Header';
import React from 'react';
import { connect } from 'react-redux';
import { APP_LOAD, REDIRECT } from '../constants/actionTypes';
import { Route, Switch } from 'react-router-dom';
import Article from '../components/Article';
import Editor from '../components/Editor';
import Home from '../components/Home';
import Login from '../components/Login';
import Profile from '../components/Profile';
import ProfileFavorites from '../components/ProfileFavorites';
import ProfileComments from '../components/ProfileComments';
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
  }};

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

  render() {
    if (this.props.appLoaded) {
      return (
        <div>
          <Header
            appName={this.props.appName}
            currentUser={this.props.currentUser} />
            <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/editor/:slug" component={Editor} />
            <Route path="/editor" component={Editor} />
            <Route path="/article/:id" component={Article} />
            <Route path="/reading-list" component={ReadingList} />
            <Route path="/settings" component={Settings} />
            <Route path="/@:username/favorites" component={ProfileFavorites} />
            <Route path="/@:username/comments" component={ProfileComments} />
            <Route path="/@:username" component={Profile} />
            </Switch>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap');

            * {
              font-family: 'Rajdhani', sans-serif;
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
              border: 1px solid #ddd;
              border-radius: 4px;
              color: #5cb85c;
              text-decoration: none;
              transition: all 0.2s;
              font-weight: 500;
            }

            .page-link:hover {
              background: #f0f8f0;
              border-color: #5cb85c;
            }

            .page-item.active .page-link {
              background: #5cb85c;
              color: white;
              border-color: #5cb85c;
            }

            .dark-theme .page-link {
              border-color: #444;
              color: #5cb85c;
            }

            .dark-theme .page-link:hover {
              background: #1a2a1a;
              border-color: #5cb85c;
            }

            .dark-theme .page-item.active .page-link {
              background: #5cb85c;
              color: white;
              border-color: #5cb85c;
            }

            @media (max-width: 768px) {
              .pagination {
                gap: 0.25rem;
              }

              .page-link {
                min-width: 40px;
                min-height: 40px;
                padding: 0.4rem 0.6rem;
                font-size: 0.9rem;
              }
            }
          `}</style>
        </div>
      );
    }
    return (
      <div>
        <Header
          appName={this.props.appName}
          currentUser={this.props.currentUser} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
