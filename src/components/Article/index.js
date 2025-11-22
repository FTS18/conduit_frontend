import ArticleMeta from './ArticleMeta';
import CommentContainer from './CommentContainer';
import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import marked from 'marked';
import { ARTICLE_PAGE_LOADED, ARTICLE_PAGE_UNLOADED } from '../../constants/actionTypes';
import { addToHistory } from '../../utils/readingHistory';

const mapStateToProps = state => ({
  ...state.article,
  currentUser: state.common.currentUser
});

const mapDispatchToProps = dispatch => ({
  onLoad: payload =>
    dispatch({ type: ARTICLE_PAGE_LOADED, payload }),
  onUnload: () =>
    dispatch({ type: ARTICLE_PAGE_UNLOADED })
});

class Article extends React.Component {
  componentWillMount() {
    const payload = Promise.all([
      agent.Articles.get(this.props.match.params.id),
      agent.Comments.forArticle(this.props.match.params.id)
    ]);
    this.props.onLoad(payload);
    payload.then(() => {
      setTimeout(() => {
        if (this.props.article) {
          addToHistory(this.props.article);
        }
      }, 100);
    });
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    if (!this.props.article) {
      return null;
    }

    const markup = { __html: marked(this.props.article.body, { sanitize: true }) };
    const canModify = this.props.currentUser &&
      this.props.currentUser.username === this.props.article.author.username;
    return (
      <div className="article-page">

        <div className="banner">
          <div className="container">

            <h1>{this.props.article.title}</h1>
            <ArticleMeta
              article={this.props.article}
              canModify={canModify} />

          </div>
        </div>

        <div className="container page">

          <div className="row article-content">
            <div className="col-xs-12">

              <div dangerouslySetInnerHTML={markup}></div>

              <ul className="tag-list">
                {
                  this.props.article.tagList.map(tag => {
                    return (
                      <li
                        className="tag-default tag-pill tag-outline"
                        key={tag}>
                        {tag}
                      </li>
                    );
                  })
                }
              </ul>

            </div>
          </div>

          <div className="row">
            <CommentContainer
              comments={this.props.comments || []}
              errors={this.props.commentErrors}
              slug={this.props.match.params.id}
              currentUser={this.props.currentUser} />
          </div>
        </div>

        <style>{`
          .article-page {
            background: #f8f9fa;
            min-height: 100vh;
          }

          .dark-theme .article-page {
            background: #0d0d0d;
          }

          .article-page .banner {
            background: #373a3c;
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
          }

          .dark-theme .article-page .banner {
            background: #1a1a1a;
          }

          .article-page .banner h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            line-height: 1.2;
          }

          .article-content {
            background: white;
            padding: 2rem;
            border-radius: 0;
            margin-bottom: 2rem;
          }

          .dark-theme .article-content {
            background: #1a1a1a;
            color: #e0e0e0;
          }

          .article-content h1,
          .article-content h2,
          .article-content h3 {
            margin: 1.5rem 0 1rem 0;
            font-weight: 600;
          }

          .article-content p {
            margin-bottom: 1rem;
            line-height: 1.6;
          }

          .article-content code {
            background: #f5f5f5;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: monospace;
          }

          .dark-theme .article-content code {
            background: #333;
          }

          .article-content pre {
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
            margin-bottom: 1rem;
          }

          .dark-theme .article-content pre {
            background: #333;
          }

          .article-actions {
            background: white;
            padding: 1.5rem;
            border-top: 1px solid #e1e4e8;
            border-bottom: 1px solid #e1e4e8;
            margin-bottom: 2rem;
          }

          .dark-theme .article-actions {
            background: #1a1a1a;
            border-color: #333;
          }

          @media (max-width: 768px) {
            .article-page .banner {
              padding: 1.5rem 0;
              margin-bottom: 1.5rem;
            }

            .article-page .banner h1 {
              font-size: 1.5rem;
              margin-bottom: 0.75rem;
            }

            .article-content {
              padding: 1.25rem;
              margin-bottom: 1.5rem;
            }

            .article-content h1,
            .article-content h2,
            .article-content h3 {
              margin: 1rem 0 0.75rem 0;
              font-size: 1.1rem;
            }

            .article-content p {
              font-size: 0.95rem;
              margin-bottom: 0.75rem;
            }

            .article-content pre {
              padding: 0.75rem;
              font-size: 0.85rem;
            }

            .article-actions {
              padding: 1rem;
              margin-bottom: 1.5rem;
            }

            .container.page {
              padding: 0;
            }
          }
        `}</style>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Article);
