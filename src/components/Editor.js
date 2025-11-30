import ListErrors from './ListErrors';
import React from 'react';
import marked from 'marked';
import agent from '../agent';
import { connect } from 'react-redux';
import '../styles/layout.css';
import {
  ADD_TAG,
  EDITOR_PAGE_LOADED,
  REMOVE_TAG,
  ARTICLE_SUBMITTED,
  EDITOR_PAGE_UNLOADED,
  UPDATE_FIELD_EDITOR
} from '../constants/actionTypes';

const mapStateToProps = state => (({
  ...state.editor
}));

const mapDispatchToProps = dispatch => (({
  onAddTag: () =>
    dispatch({ type: ADD_TAG }),
  onLoad: payload =>
    dispatch({ type: EDITOR_PAGE_LOADED, payload }),
  onRemoveTag: tag =>
    dispatch({ type: REMOVE_TAG, tag }),
  onSubmit: payload =>
    dispatch({ type: ARTICLE_SUBMITTED, payload }),
  onUnload: payload =>
    dispatch({ type: EDITOR_PAGE_UNLOADED }),
  onUpdateField: (key, value) =>
    dispatch({ type: UPDATE_FIELD_EDITOR, key, value })
}));

class Editor extends React.Component {
  constructor() {
    super();
    this.state = { activeTab: 'write' };

    const updateFieldEvent =
      key => ev => this.props.onUpdateField(key, ev.target.value);
    this.changeTitle = updateFieldEvent('title');
    this.changeDescription = updateFieldEvent('description');
    this.changeBody = updateFieldEvent('body');
    this.changeTagInput = updateFieldEvent('tagInput');

    this.watchForEnter = ev => {
      if (ev.keyCode === 13) {
        ev.preventDefault();
        this.props.onAddTag();
      }
    };

    this.removeTagHandler = tag => () => {
      this.props.onRemoveTag(tag);
    };

    this.submitForm = ev => {
      ev.preventDefault();
      const article = {
        title: this.props.title,
        description: this.props.description,
        body: this.props.body,
        tagList: this.props.tagList
      };

      const slug = { slug: this.props.articleSlug };
      const promise = this.props.articleSlug ?
        agent.Articles.update(Object.assign(article, slug)) :
        agent.Articles.create(article);

      this.props.onSubmit(promise);
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.slug !== nextProps.match.params.slug) {
      if (nextProps.match.params.slug) {
        this.props.onUnload();
        return this.props.onLoad(agent.Articles.get(this.props.match.params.slug));
      }
      this.props.onLoad(null);
    }
  }

  componentWillMount() {
    if (this.props.match.params.slug) {
      return this.props.onLoad(agent.Articles.get(this.props.match.params.slug));
    }
    this.props.onLoad(null);
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    return (
      <div className="editor-content">
        <div className="content-section">
        <div className="editor-main">
          <ListErrors errors={this.props.errors}></ListErrors>

          <form>
            <fieldset>

              <fieldset className="form-group">
                <input
                  className="form-control form-control-lg"
                  type="text"
                  placeholder="Article Title"
                  value={this.props.title}
                  onChange={this.changeTitle} />
              </fieldset>

              <fieldset className="form-group">
                <input
                  className="form-control"
                  type="text"
                  placeholder="What's this article about?"
                  value={this.props.description}
                  onChange={this.changeDescription} />
              </fieldset>

              <div className="editor-tabs">
                <button
                  type="button"
                  className={`editor-tab ${this.state.activeTab === 'write' ? 'active' : ''}`}
                  onClick={() => this.setState({ activeTab: 'write' })}
                >
                  Write
                </button>
                <button
                  type="button"
                  className={`editor-tab ${this.state.activeTab === 'preview' ? 'active' : ''}`}
                  onClick={() => this.setState({ activeTab: 'preview' })}
                >
                  Preview
                </button>
              </div>

              <fieldset className="form-group">
                {this.state.activeTab === 'write' ? (
                  <textarea
                    className="form-control"
                    rows="8"
                    placeholder="Write your article (in markdown)"
                    value={this.props.body}
                    onChange={this.changeBody}>
                  </textarea>
                ) : (
                  <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: marked(this.props.body || '') }}></div>
                )}
              </fieldset>

              <fieldset className="form-group">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Enter tags"
                  value={this.props.tagInput}
                  onChange={this.changeTagInput}
                  onKeyUp={this.watchForEnter} />
                <div className="tag-help-text">Press Enter to add a tag</div>

                <div className="tag-list">
                  {(this.props.tagList || []).map(tag => {
                    return (
                      <span className="tag-default tag-pill" key={tag}>
                        <i className="ion-close-round"
                          onClick={this.removeTagHandler(tag)}>
                        </i>
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </fieldset>

              <button
                className="btn btn-lg pull-xs-right btn-primary"
                type="button"
                disabled={this.props.inProgress}
                onClick={this.submitForm}>
                Publish Article
              </button>

            </fieldset>
          </form>
        </div>
        </div>

        <style>{`
          .editor-page {
            background: var(--bg-body);
            min-height: 100vh;
            padding: 2rem;
          }

          .editor-content {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            width: 100%;
            height: 100vh;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
          }

          .editor-main {
            background: var(--bg-card);
            border-radius: 8px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-color);
            width: 100%;
            box-sizing: border-box;
          }

          .editor-main .form-control {
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 0.75rem;
            font-size: 1rem;
            color: var(--text-secondary);
            background: var(--bg-hover);
            transition: border-color 0.2s;
          }

          .editor-main .form-control:focus {
            border-color: var(--primary);
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
          }

          .editor-main .form-control-lg {
            font-size: 1.5rem;
            padding: 1rem;
          }

          .editor-main textarea.form-control {
            resize: vertical;
            min-height: 200px;
          }

          .editor-main .form-group {
            margin-bottom: 1.5rem;
          }

          .editor-main .tag-list {
            margin-top: 1rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .editor-main .tag-pill {
            display: inline-block;
            padding: 0.5rem 0.75rem;
            background: var(--bg-hover);
            color: var(--text-secondary);
            border-radius: 20px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid var(--border-color);
          }

          .editor-main .tag-pill:hover {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
          }

          .editor-main .tag-pill i {
            margin-right: 0.5rem;
            cursor: pointer;
          }

          .editor-main .btn {
            min-height: 44px;
            font-size: 1rem;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
          }

          @media (max-width: 768px) {
            .editor-page {
              padding-top: 56px;
            }

            .editor-main {
              margin: 0.5rem;
              padding: 1rem;
              border-radius: 6px;
            }

            .editor-main .form-control {
              font-size: 16px;
              padding: 0.85rem;
            }

            .editor-main .form-control-lg {
              font-size: 1.25rem;
              padding: 0.85rem;
            }

            .editor-main textarea.form-control {
              min-height: 150px;
            }

            .editor-main .btn {
              width: 100%;
              margin-top: 1rem;
            }

            .pull-xs-right {
              float: none !important;
            }
          }

          .editor-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 0;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1rem;
          }

          .editor-tab {
            background: none;
            border: none;
            padding: 0.5rem 1rem;
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-secondary);
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s;
          }

          .editor-tab:hover {
            background: var(--bg-hover);
            color: var(--primary);
          }

          .editor-tab.active {
            background: var(--bg-hover);
            color: var(--primary);
          }

          .markdown-preview {
            min-height: 200px;
            padding: 1rem;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background: var(--bg-body);
            color: var(--text-main);
            overflow-y: auto;
            line-height: 1.6;
          }

          .markdown-preview h1, .markdown-preview h2, .markdown-preview h3 {
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
          }

          .markdown-preview p {
            margin-bottom: 1rem;
          }

          .markdown-preview ul, .markdown-preview ol {
            padding-left: 1.5rem;
            margin-bottom: 1rem;
          }

          .markdown-preview code {
            background: var(--bg-hover);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: monospace;
          }

          .markdown-preview pre {
            background: var(--bg-hover);
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            margin-bottom: 1rem;
          }

          .tag-help-text {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
            margin-left: 0.25rem;
          }
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
