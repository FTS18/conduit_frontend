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
      <div className="reading-list-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-9">
              <div className="feed-toggle">
                <ul className="nav nav-pills outline-active">
                  <li className="nav-item">
                    <div className="nav-link active">
                      Reading List ({articlesCount || 0})
                    </div>
                  </li>
                </ul>
              </div>
              <ArticleList articles={articles} />
            </div>
          </div>
        </div>

        <style>{`
          .reading-list-page {
            background: #f8f9fa;
            min-height: 100vh;
            padding: 2rem 0;
          }

          .dark-theme .reading-list-page {
            background: #0d0d0d;
          }

          .reading-list-page .feed-toggle {
            background: white;
            border: 1px solid #e1e4e8;
            border-radius: 0;
            margin-bottom: 1.5rem;
            padding: 0;
            overflow: hidden;
          }

          .dark-theme .reading-list-page .feed-toggle {
            background: #1a1a1a;
            border-color: #333;
          }

          .reading-list-page .feed-toggle .nav-pills {
            border-bottom: 1px solid #e1e4e8;
          }

          .dark-theme .reading-list-page .feed-toggle .nav-pills {
            border-bottom-color: #333;
          }

          .reading-list-page .feed-toggle .nav-link {
            color: #373a3c;
            border: none;
            border-radius: 0;
            padding: 1rem 1.5rem;
            font-weight: 600;
          }

          .dark-theme .reading-list-page .feed-toggle .nav-link {
            color: #ccc;
          }

          .reading-list-page .feed-toggle .nav-link.active {
            background: transparent;
            color: #5cb85c;
            border-bottom: 3px solid #5cb85c;
          }

          @media (max-width: 768px) {
            .reading-list-page {
              padding: 1rem 0;
            }

            .col-md-9 {
              width: 100% !important;
              padding: 0 1rem;
            }

            .reading-list-page .feed-toggle .nav-link {
              padding: 0.75rem 1rem;
              font-size: 0.9rem;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReadingList);
