import ArticleList from '../ArticleList';
import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import { CHANGE_TAB } from '../../constants/actionTypes';

const YourFeedTab = props => {
  if (props.token) {
    const clickHandler = ev => {
      ev.preventDefault();
      props.onTabClick('feed', agent.Articles.combinedFeed, agent.Articles.combinedFeed());
    }

    return (
      <li className="feed-tab">
        <a  href=""
            className={ props.tab === 'feed' ? 'feed-tab-link active' : 'feed-tab-link' }
            onClick={clickHandler}
            title="Personalized feed from your followed users + recommended articles">
          Your Feed
        </a>
      </li>
    );
  }
  return null;
};

const GlobalFeedTab = props => {
  const clickHandler = ev => {
    ev.preventDefault();
    props.onTabClick('all', agent.Articles.all, agent.Articles.all());
  };
  return (
    <li className="feed-tab">
      <a
        href=""
        className={ props.tab === 'all' ? 'feed-tab-link active' : 'feed-tab-link' }
        onClick={clickHandler}
        title="All articles from all users">
        Global Feed
      </a>
    </li>
  );
};

const TagFilterTab = props => {
  if (!props.tag) {
    return null;
  }

  return (
    <li className="feed-tab">
      <a href="" className="feed-tab-link active">
        #{props.tag}
      </a>
    </li>
  );
};

const mapStateToProps = state => (({
  ...state.articleList,
  tags: state.home.tags,
  token: state.common.token
}));

const mapDispatchToProps = dispatch => (({
  onTabClick: (tab, pager, payload) => dispatch({ type: CHANGE_TAB, tab, pager, payload })
}));

class MainView extends React.Component {
  state = { postContent: '' };

  handlePostChange = (e) => {
    this.setState({ postContent: e.target.value });
  };

  handlePostSubmit = () => {
    if (this.state.postContent.trim()) {
      console.log('Post:', this.state.postContent);
      this.setState({ postContent: '' });
    }
  };

  render() {
    const { props } = this;
    return (
      <div className="col-md-9" style={{ width: '100%', maxWidth: 'none' }}>
        <div className="whats-happening-box">
          <textarea
            placeholder="What's happening?!"
            value={this.state.postContent}
            onChange={this.handlePostChange}
            className="post-textarea"
            rows="3"
          />
          <div className="post-actions">
            <button 
              className="post-btn"
              onClick={this.handlePostSubmit}
              disabled={!this.state.postContent.trim()}
            >
              Post
            </button>
          </div>
        </div>

        <div className="feed-toggle-container">
          <ul className="feed-toggle">
            <YourFeedTab
              token={props.token}
              tab={props.tab}
              onTabClick={props.onTabClick} />

            <GlobalFeedTab tab={props.tab} onTabClick={props.onTabClick} />

            <TagFilterTab tag={props.tag} />
          </ul>
        </div>

        <ArticleList
          pager={props.pager}
          articles={props.articles}
          loading={props.loading}
          articlesCount={props.articlesCount}
          currentPage={props.currentPage} />

        <style>{`
          .whats-happening-box {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1.5rem;
            width: 100%;
            box-sizing: border-box;
          }

          .post-textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 0.95rem;
            background: var(--bg-hover);
            color: var(--text-main);
            box-sizing: border-box;
            transition: all 0.2s;
            font-family: inherit;
            resize: vertical;
          }

          .post-textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
          }

          .post-textarea::placeholder {
            color: var(--text-light);
          }

          .post-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 0.75rem;
          }

          .post-btn {
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.5rem 1.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .post-btn:hover:not(:disabled) {
            background: var(--primary-hover);
          }

          .post-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .feed-toggle-container {
            margin-bottom: 2rem;
            margin-top: 0;
          }

          .feed-toggle {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 0.5rem;
            margin: 0;
            list-style: none;
            display: flex;
            gap: 0.5rem;
            overflow-x: auto;
            scrollbar-width: none;
          }

          .feed-toggle::-webkit-scrollbar {
            display: none;
          }

          .feed-tab {
            flex: 1;
            min-width: 120px;
            margin: 0;
            padding: 0;
            list-style: none;
          }

          .feed-tab-link {
            display: block;
            padding: 0.75rem 1rem;
            border: none;
            border-radius: 8px;
            color: var(--text-secondary);
            font-size: 0.95rem;
            font-weight: 500;
            transition: all 0.25s ease;
            text-align: center;
            background: transparent;
            text-decoration: none;
            cursor: pointer;
            font-family: 'Rajdhani', sans-serif;
          }

          .feed-tab-link:hover {
            background: var(--bg-hover);
            color: var(--primary);
          }

          .feed-tab-link.active {
            background: var(--primary);
            color: white;
            font-weight: 600;
          }

          @media (max-width: 768px) {
            .whats-happening-box {
              margin-bottom: 1rem;
              padding: 0.75rem;
            }

            .post-textarea {
              padding: 0.625rem;
              font-size: 0.9rem;
            }

            .feed-toggle-container {
              margin-bottom: 1.5rem;
            }

            .feed-toggle {
              padding: 0.4rem;
              gap: 0.3rem;
            }

            .feed-tab {
              min-width: 100px;
            }

            .feed-tab-link {
              padding: 0.65rem 0.75rem;
              font-size: 0.85rem;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainView);
