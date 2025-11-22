import ListErrors from './ListErrors';
import React from 'react';
import agent from '../agent';
import { connect } from 'react-redux';
import {
  ADD_TAG,
  EDITOR_PAGE_LOADED,
  REMOVE_TAG,
  ARTICLE_SUBMITTED,
  EDITOR_PAGE_UNLOADED,
  UPDATE_FIELD_EDITOR
} from '../constants/actionTypes';

const mapStateToProps = state => ({
  ...state.editor
});

const mapDispatchToProps = dispatch => ({
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
});

class Editor extends React.Component {
  constructor() {
    super();

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
      <div className="editor-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-10 offset-md-1 col-xs-12">

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

                  <fieldset className="form-group">
                    <textarea
                      className="form-control"
                      rows="8"
                      placeholder="Write your article (in markdown)"
                      value={this.props.body}
                      onChange={this.changeBody}>
                    </textarea>
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter tags"
                      value={this.props.tagInput}
                      onChange={this.changeTagInput}
                      onKeyUp={this.watchForEnter} />

                    <div className="tag-list">
                      {
                        (this.props.tagList || []).map(tag => {
                          return (
                            <span className="tag-default tag-pill" key={tag}>
                              <i  className="ion-close-round"
                                  onClick={this.removeTagHandler(tag)}>
                              </i>
                              {tag}
                            </span>
                          );
                        })
                      }
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
        </div>

        <style>{`
          .editor-page {
            background: #f8f9fa;
            min-height: 100vh;
            padding: 2rem 0;
          }

          .dark-theme .editor-page {
            background: #0d0d0d;
          }

          .editor-page .form-control {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.75rem;
            font-size: 1rem;
            color: #373a3c;
            background: white;
            transition: border-color 0.2s;
          }

          .editor-page .form-control:focus {
            border-color: #5cb85c;
            outline: none;
            box-shadow: 0 0 0 3px rgba(92, 184, 92, 0.1);
          }

          .dark-theme .editor-page .form-control {
            background: #1a1a1a;
            color: #e0e0e0;
            border-color: #333;
          }

          .dark-theme .editor-page .form-control:focus {
            border-color: #5cb85c;
            box-shadow: 0 0 0 3px rgba(92, 184, 92, 0.2);
          }

          .editor-page .form-control-lg {
            font-size: 1.5rem;
            padding: 1rem;
          }

          .editor-page textarea.form-control {
            resize: vertical;
            min-height: 200px;
          }

          .editor-page .form-group {
            margin-bottom: 1.5rem;
          }

          .editor-page .tag-list {
            margin-top: 1rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .editor-page .tag-pill {
            display: inline-block;
            padding: 0.5rem 0.75rem;
            background: #818a8f;
            color: white;
            border-radius: 16px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
          }

          .editor-page .tag-pill:hover {
            background: #5cb85c;
          }

          .editor-page .tag-pill i {
            margin-right: 0.5rem;
            cursor: pointer;
          }

          .dark-theme .editor-page .tag-pill {
            background: #555;
          }

          .dark-theme .editor-page .tag-pill:hover {
            background: #5cb85c;
          }

          .editor-page .btn {
            min-height: 44px;
            font-size: 1rem;
            padding: 0.75rem 1.5rem;
          }

          @media (max-width: 768px) {
            .editor-page {
              padding: 1rem 0;
            }

            .col-md-10 {
              width: 100% !important;
              margin-left: 0 !important;
              padding: 0 1rem;
            }

            .editor-page .form-control {
              font-size: 16px;
              padding: 0.85rem;
            }

            .editor-page .form-control-lg {
              font-size: 1.25rem;
              padding: 0.85rem;
            }

            .editor-page textarea.form-control {
              min-height: 150px;
            }

            .editor-page .btn {
              width: 100%;
              margin-top: 1rem;
            }

            .pull-xs-right {
              float: none !important;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
