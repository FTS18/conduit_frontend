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
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'date',
      filterTag: null,
      searchQuery: '',
      selectedForDelete: new Set()
    };
  }

  componentWillMount() {
    this.props.onLoad();
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  getFilteredAndSortedArticles = () => {
    const { articles = [] } = this.props;
    const { sortBy, filterTag, searchQuery, selectedForDelete } = this.state;

    let filtered = articles.filter(article => {
      const matchesTag = !filterTag || (article.tagList && article.tagList.includes(filterTag));
      const matchesSearch = !searchQuery || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTag && matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.username.localeCompare(b.author.username);
        case 'date':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }

  getAllTags = () => {
    const { articles = [] } = this.props;
    const tags = new Set();
    articles.forEach(article => {
      (article.tagList || []).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  toggleSelectArticle = (slug) => {
    const { selectedForDelete } = this.state;
    const newSelected = new Set(selectedForDelete);
    if (newSelected.has(slug)) {
      newSelected.delete(slug);
    } else {
      newSelected.add(slug);
    }
    this.setState({ selectedForDelete: newSelected });
  }

  deleteSelected = async () => {
    const { selectedForDelete } = this.state;
    if (selectedForDelete.size === 0 || !window.confirm(`Delete ${selectedForDelete.size} bookmarks?`)) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedForDelete).map(slug => agent.Articles.unbookmark(slug))
      );
      this.setState({ selectedForDelete: new Set() });
      this.props.onLoad();
    } catch (err) {
      console.error('Failed to delete bookmarks:', err);
    }
  }

  render() {
    const { articles = [], articlesCount } = this.props;
    const { sortBy, filterTag, searchQuery, selectedForDelete } = this.state;
    const filteredArticles = this.getFilteredAndSortedArticles();
    const allTags = this.getAllTags();

    return (
      <div className="bookmarks-page">
        <div className="bookmarks-container">
          <div className="bookmarks-header">
            <h2 className="bookmarks-heading">Bookmarks</h2>
            <span className="bookmark-count">{filteredArticles.length} saved</span>
          </div>

          {articles.length > 0 && (
            <div className="bookmarks-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => this.setState({ searchQuery: e.target.value })}
                  className="search-input"
                />
              </div>

              <div className="filter-controls">
                <select
                  value={sortBy}
                  onChange={(e) => this.setState({ sortBy: e.target.value })}
                  className="sort-select"
                >
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="author">Sort by Author</option>
                </select>

                {allTags.length > 0 && (
                  <select
                    value={filterTag || ''}
                    onChange={(e) => this.setState({ filterTag: e.target.value || null })}
                    className="filter-select"
                  >
                    <option value="">All Tags</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                )}

                {selectedForDelete.size > 0 && (
                  <button
                    onClick={this.deleteSelected}
                    className="btn-delete-selected"
                  >
                    Delete {selectedForDelete.size}
                  </button>
                )}
              </div>
            </div>
          )}

          {filteredArticles.length === 0 ? (
            <div className="empty-state">
              <p>No bookmarks found</p>
            </div>
          ) : (
            <div className="bookmarks-list">
              {filteredArticles.map(article => (
                <div key={article.slug} className="bookmark-item">
                  <input
                    type="checkbox"
                    checked={selectedForDelete.has(article.slug)}
                    onChange={() => this.toggleSelectArticle(article.slug)}
                    className="bookmark-checkbox"
                  />
                  <div className="bookmark-content">
                    <a href={`/#/article/${article.slug}`} className="bookmark-title">
                      {article.title}
                    </a>
                    <p className="bookmark-meta">
                      by {article.author.username} • {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`
          .bookmarks-page {
            background: var(--bg-body);
            min-height: 100vh;
            padding: 2rem 1rem;
          }

          .bookmarks-container {
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
          }

          .bookmarks-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .bookmarks-heading {
            color: var(--primary);
            font-size: 1.8rem;
            font-weight: 700;
            margin: 0;
          }

          .bookmark-count {
            color: var(--text-secondary);
            font-size: 0.9rem;
          }

          .bookmarks-controls {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
          }

          .search-box {
            flex: 1;
            min-width: 200px;
          }

          .search-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            background: var(--bg-card);
            color: var(--text-main);
            font-size: 0.9rem;
          }

          .search-input::placeholder {
            color: var(--text-light);
          }

          .filter-controls {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .sort-select,
          .filter-select {
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            background: var(--bg-card);
            color: var(--text-main);
            font-size: 0.9rem;
            cursor: pointer;
          }

          .btn-delete-selected {
            padding: 0.75rem 1rem;
            background: var(--primary);
            color: var(--bg-body);
            border: none;
            border-radius: 4px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: opacity 0.2s;
          }

          .btn-delete-selected:hover {
            opacity: 0.8;
          }

          .bookmarks-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .bookmark-item {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            transition: all 0.2s;
          }

          .bookmark-item:hover {
            box-shadow: var(--shadow-md);
            border-color: var(--primary);
          }

          .bookmark-checkbox {
            margin-top: 0.25rem;
            cursor: pointer;
            width: 18px;
            height: 18px;
          }

          .bookmark-content {
            flex: 1;
            min-width: 0;
          }

          .bookmark-title {
            display: block;
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 0.5rem;
            word-break: break-word;
          }

          .bookmark-title:hover {
            text-decoration: underline;
          }

          .bookmark-meta {
            color: var(--text-secondary);
            font-size: 0.85rem;
            margin: 0;
          }

          .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: var(--text-light);
          }

          @media (max-width: 768px) {
            .bookmarks-page {
              padding: 1rem 0.5rem;
            }

            .bookmarks-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }

            .bookmarks-heading {
              font-size: 1.5rem;
            }

            .bookmarks-controls {
              flex-direction: column;
            }

            .filter-controls {
              width: 100%;
            }

            .sort-select,
            .filter-select {
              flex: 1;
              min-width: 100px;
            }

            .bookmark-item {
              gap: 0.75rem;
              padding: 0.75rem;
            }

            .bookmark-title {
              font-size: 0.95rem;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReadingList);
