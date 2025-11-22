import Banner from './Banner';
import MainView from './MainView';
import React from 'react';
import Tags from './Tags';
import RecommendedProfiles from '../RecommendedProfiles';
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
      // First get regular articles
      const regularArticles = await agent.Articles.all();
      
      // Try to get all profiles from API
      let allAuthors = [];
      try {
        const profilesResult = await agent.Profile.getAllUsers();
        allAuthors = profilesResult.profiles || profilesResult.users || [];
        console.log('🔍 Found', allAuthors.length, 'authors in API');
      } catch (err) {
        console.log('❌ No additional authors API available');
        return regularArticles;
      }

      // Fetch articles by each author
      const authorArticlesPromises = allAuthors.slice(0, 10).map(author => 
        agent.Articles.byAuthor(author.username, 0).catch(err => {
          console.log(`⚠️ No articles found for ${author.username}`);
          return { articles: [] };
        })
      );

      const authorArticlesResults = await Promise.all(authorArticlesPromises);
      
      // Combine all articles
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

        <Banner token={this.props.token} appName={this.props.appName} />

        <div className="container page">
          <div className="mobile-profiles">
            <RecommendedProfiles currentUser={this.props.currentUser} showOnlyOnHome={true} />
          </div>
          <div className="row">
            <MainView />

            <div className="col-md-3" style={{ display: 'block' }}>
              <div className="sidebar">
                <div className="sidebar-card">
                  <div className="sidebar-header">
                    <span className="sidebar-icon">🏷️</span>
                    <h3>Popular Tags</h3>
                    <div className="sidebar-accent"></div>
                  </div>
                  <div className="sidebar-content">
                    {this.props.tags ? (
                      <Tags
                        tags={this.props.tags}
                        onClickTag={this.props.onClickTag} />
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {[...Array(12)].map((_, i) => (
                          <div key={i} style={{
                            height: '32px',
                            width: '80px',
                            background: 'linear-gradient(90deg, #e1e4e8 25%, #f0f0f0 50%, #e1e4e8 75%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s infinite',
                            borderRadius: '20px'
                          }}></div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <RecommendedProfiles currentUser={this.props.currentUser} showOnlyOnHome={true} />
              </div>
            </div>
          </div>
        </div>

        <footer className="footer">
          <div className="container">
            <p>&copy; 2025 Conduit. All rights reserved.</p>
          </div>
        </footer>

        <style>{`
          .home-page {
            background: #f8f9fa;
            min-height: 100vh;
          }

          .dark-theme .home-page {
            background: #0d0d0d;
          }

          @media (max-width: 768px) {
            .home-page {
              background: #f5f5f5;
            }

            .dark-theme .home-page {
              background: #0a0a0a;
            }
          }

          .container.page {
            background: transparent;
            padding: 2rem 0;
          }

          .sidebar {
            position: sticky;
            top: 100px;
            max-height: calc(100vh - 120px);
            overflow-y: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .sidebar::-webkit-scrollbar {
            display: none;
          }

          .sidebar-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border: 1px solid #e1e4e8;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            margin-bottom: 1.5rem;
            overflow: hidden;
            transition: all 0.3s ease;
          }

          .sidebar-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          }

          .dark-theme .sidebar-card {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            border-color: #333;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .dark-theme .sidebar-card:hover {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          }

          .sidebar-header {
            background: linear-gradient(135deg, #5cb85c 0%, #4a9d4a 100%);
            padding: 1rem 1.5rem;
            position: relative;
            overflow: hidden;
          }

          .sidebar-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
            transform: translateX(-100%);
            transition: transform 0.6s;
          }

          .sidebar-card:hover .sidebar-header::before {
            transform: translateX(100%);
          }

          .sidebar-header h3 {
            color: white;
            margin: 0;
            font-size: 1rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .sidebar-icon {
            font-size: 1.2rem;
            filter: brightness(0) invert(1);
          }

          .sidebar-accent {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 3px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 2px;
          }

          .sidebar-content {
            padding: 1.5rem;
          }

          .sidebar .tag-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
          }

          .sidebar .tag-pill {
            display: inline-flex;
            align-items: center;
            padding: 0.6rem 1.2rem;
            background-color: #c8e6c9 !important;
            color: #1b5e20 !important;
            border: 1.5px solid #66bb6a !important;
            border-radius: 20px;
            text-decoration: none !important;
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.2s;
            cursor: pointer;
            min-height: 32px;
          }

          .sidebar .tag-pill:hover {
            background-color: #5cb85c;
            color: white;
            border-color: #5cb85c;
            transform: translateY(-2px);
            box-shadow: 0 2px 6px rgba(92, 184, 92, 0.3);
          }

          .sidebar .tag-pill.active {
            background-color: #5cb85c;
            color: white;
            border-color: #5cb85c;
            box-shadow: 0 2px 6px rgba(92, 184, 92, 0.3);
          }

          .dark-theme .sidebar .tag-pill {
            background-color: #1b5e20;
            color: #81c784;
            border-color: #2e7d32;
          }

          .dark-theme .sidebar .tag-pill:hover {
            background-color: #5cb85c;
            color: white;
            border-color: #5cb85c;
          }

          .dark-theme .sidebar .tag-pill.active {
            background-color: #5cb85c;
            color: white;
            border-color: #5cb85c;
          }

          .footer {
            background: white;
            border-top: 1px solid #e1e4e8;
            padding: 2rem 0;
            margin-top: 2rem;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
            position: relative;
            width: 100%;
          }

          .dark-theme .footer {
            background: #1a1a1a;
            border-top-color: #333;
            color: #aaa;
          }

          .article-preview {
            background: white;
            border: 1px solid #e1e4e8;
            border-radius: 0;
            box-shadow: none;
            margin-bottom: 1.5rem;
            padding: 1.5rem;
            transition: all 0.2s;
          }

          .article-preview:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .dark-theme .article-preview {
            background: #1a1a1a;
            border-color: #333;
            color: #e0e0e0;
          }

          .dark-theme .article-preview:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .feed-toggle {
            background: white;
            border: 1px solid #e1e4e8;
            border-radius: 0;
            box-shadow: none;
            margin-bottom: 0;
            padding: 0;
            overflow: hidden;
          }

          .dark-theme .feed-toggle {
            background: #1a1a1a;
            border-color: #333;
            box-shadow: none;
          }

          .feed-toggle .nav-pills {
            border-bottom: 1px solid #e1e4e8;
          }

          .dark-theme .feed-toggle .nav-pills {
            border-bottom-color: #333;
          }

          .feed-toggle .nav-link {
            color: #373a3c !important;
            border: none;
            border-radius: 0;
            padding: 1rem 1.5rem;
          }

          .dark-theme .feed-toggle .nav-link {
            color: #ccc !important;
          }

          .feed-toggle .nav-link.active {
            background: transparent !important;
            color: #5cb85c !important;
            border-bottom: 3px solid #5cb85c !important;
            font-weight: 600;
          }

          .dark-theme .feed-toggle .nav-link.active {
            color: #5cb85c !important;
            border-bottom-color: #5cb85c !important;
          }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

          .mobile-profiles {
            display: none;
          }

          @media (max-width: 768px) {
            .col-md-3 {
              display: none !important;
            }
            
            .col-md-9 {
              width: 100% !important;
            }

            .mobile-profiles {
              display: block;
              padding: 0;
              margin-bottom: 1rem;
            }

            .feed-toggle {
              margin: 0 0.75rem 1rem 0.75rem;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }

            .dark-theme .feed-toggle {
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }

            .feed-toggle .nav-link {
              padding: 1rem 1.5rem;
              font-size: 0.95rem;
              font-weight: 600;
            }

            .feed-toggle .nav-link.active {
              background: linear-gradient(135deg, #5cb85c, #4a9d4a) !important;
              color: white !important;
              border-bottom: none !important;
            }

            .container.page {
              padding: 1rem 0;
              background: #f8f9fa;
            }

            .dark-theme .container.page {
              background: #0d0d0d;
            }

            .sidebar {
              position: static;
              max-height: none;
            }

            .footer {
              padding: 1.5rem 0;
              font-size: 0.85rem;
              margin: 0 0.75rem;
              border-radius: 16px 16px 0 0;
            }
          }
        `}</style>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
