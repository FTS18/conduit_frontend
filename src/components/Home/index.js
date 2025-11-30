import MainView from './MainView';
import React from 'react';
import TagsToolbar from '../TagsToolbar';
import agent from '../../agent';
import { connect } from 'react-redux';
import {
  HOME_PAGE_LOADED,
  HOME_PAGE_UNLOADED,
  APPLY_TAG_FILTER
} from '../../constants/actionTypes';

const Promise = global.Promise;

const mapStateToProps = state => ((
  {
    ...state.home,
    appName: state.common.appName,
    token: state.common.token,
    currentUser: state.common.currentUser
  }
));

const mapDispatchToProps = dispatch => ((
  {
    onClickTag: (tag, pager, payload) =>
      dispatch({ type: APPLY_TAG_FILTER, tag, pager, payload }),
    onLoad: (tab, pager, payload) =>
      dispatch({ type: HOME_PAGE_LOADED, tab, pager, payload }),
    onUnload: () =>
      dispatch({ type: HOME_PAGE_UNLOADED })
  }
));

class Home extends React.Component {
  componentWillMount() {
    const tab = this.props.token ? 'feed' : 'all';

    const articlesPromise = this.props.token ?
      agent.Articles.combinedFeed() :
      this.fetchAllAuthorsArticles();

    this.props.onLoad(tab, null, Promise.all([agent.Tags.getAll(), articlesPromise]));
  }

  fetchAllAuthorsArticles = async () => {
    try {
      const regularArticles = await agent.Articles.all();
      
      let allAuthors = [];
      try {
        const profilesResult = await agent.Profile.getAllUsers();
        allAuthors = profilesResult.profiles || profilesResult.users || [];
        console.log('🔍 Found', allAuthors.length, 'authors in API');
      } catch (err) {
        console.log('❌ No additional authors API available');
        return regularArticles;
      }

      const authorArticlesPromises = allAuthors.slice(0, 10).map(author =>
        agent.Articles.byAuthor(author.username, 0).catch(err => {
          console.log(`⚠️ No articles found for ${author.username}`);
          return { articles: [] };
        })
      );

      const authorArticlesResults = await Promise.all(authorArticlesPromises);

      const allArticles = [...regularArticles.articles];
      const seenSlugs = new Set(regularArticles.articles.map(a => a.slug));

      authorArticlesResults.forEach(result => {
        if (result.articles) {
          result.articles.forEach(article => {
            if (!seenSlugs.has(article.slug)) {
              seenSlugs.add(article.slug);
              allArticles.push(article);
            }
          });
        }
      });

      console.log('📚 Total articles loaded:', allArticles.length, '(including from API authors)');

      return {
        articles: allArticles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        articlesCount: allArticles.length
      };
    } catch (err) {
      console.error('Error fetching all authors articles:', err);
      return agent.Articles.all();
    }
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    return (
      <div className="home-page">
        <TagsToolbar />

        <div className="home-content">
          <div className="feed-section">
            <MainView />
          </div>
        </div>

        <footer className="footer">
          <div className="container">
            <p>&copy; 2025 Conduit. All rights reserved.</p>
          </div>
        </footer>

        <style>{`
          .home-page {
            background: var(--bg-body);
            min-height: 100vh;
            width: 100%;
            box-sizing: border-box;
            overflow-x: hidden;
          }

          .tags-toolbar {
            position: fixed;
            top: 56px;
            left: 280px;
            right: 360px;
            z-index: 999;
            width: calc(100% - 640px);
          }

          .home-content {
            display: flex;
            gap: 0;
            padding: 0;
            margin-top: 56px;
            width: 100%;
            min-height: calc(100vh - 56px);
            box-sizing: border-box;
          }

          .feed-section {
            flex: 1;
            min-width: 0;
            box-sizing: border-box;
            padding: 2rem;
            width: 100%;
            margin-top: 0;
          }

          .footer {
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
            padding: 3rem 0;
            margin-top: 4rem;
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.9rem;
            position: relative;
            width: 100%;
            box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.3);
          }

          @media (max-width: 768px) {
            body {
              overflow-x: hidden !important;
            }
            .home-page {
              background: var(--bg-body);
            }

            .tags-toolbar {
              position: fixed !important;
              top: 56px !important;
              left: 0 !important;
              right: 0 !important;
              width: 100% !important;
              z-index: 1001 !important;
            }

            .home-content {
              display: block !important;
              padding: 0.5rem !important;
              margin-top: 0 !important;
              gap: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
            }

            .feed-section {
              width: 100% !important;
              min-width: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
              box-sizing: border-box !important;
              max-width: 100% !important;
            }

            .feed-toggle {
              margin: 0.5rem !important;
              padding: 0 !important;
              width: calc(100% - 1rem) !important;
              box-sizing: border-box !important;
            }

            .article-preview {
              font-size: 0.9rem !important;
              margin: 0.5rem !important;
              padding: 1rem !important;
              width: calc(100% - 1rem) !important;
              box-sizing: border-box !important;
            }

            .footer {
              margin: 0.5rem !important;
              padding: 1rem !important;
              width: calc(100% - 1rem) !important;
              box-sizing: border-box !important;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
