import React from 'react';
import { connect } from 'react-redux';
import agent from '../agent';
import {
  BOOKMARKS_PAGE_LOADED,
  BOOKMARKS_PAGE_UNLOADED
} from '../constants/actionTypes';
import ArticleList from './ArticleList';

const mapStateToProps = state => ({
  ...state.bookmarks,
  currentUser: state.common.currentUser
});

const mapDispatchToProps = dispatch => ({
  onLoad: () => dispatch({
    type: BOOKMARKS_PAGE_LOADED,
    payload: agent.Bookmarks.getAll()
  }),
  onUnload: () => dispatch({ type: BOOKMARKS_PAGE_UNLOADED })
});

class ReadingList extends React.Component {
  componentWillMount() {
    this.props.onLoad();
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    const { articles, articlesCount } = this.props;

    return (
      <div className="bookmarks-page">
        <div className="bookmarks-container">
          <h2 className="bookmarks-heading">Bookmarks</h2>
          <ArticleList articles={articles} />
        </div>

        <style>{`
          .bookmarks-page {
            background: var(--bg-body);
            min-height: 100vh;
            padding: 2rem 1rem;
          }

          .bookmarks-container {
            width: 100%;
            max-width: none;
          }

          .bookmarks-heading {
            color: var(--primary);
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 2rem;
            padding: 0;
          }

          @media (max-width: 768px) {
            .bookmarks-page {
              padding: 1rem 0.5rem;
            }

            .bookmarks-heading {
              font-size: 1.5rem;
              margin-bottom: 1.5rem;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReadingList);
