import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import { ADD_COMMENT } from '../../constants/actionTypes';
import UserAvatar from '../UserAvatar';

const mapDispatchToProps = dispatch => ({
  onSubmit: payload =>
    dispatch({ type: ADD_COMMENT, payload })
});

class CommentInput extends React.Component {
  constructor() {
    super();
    this.state = {
      body: ''
    };

    this.setBody = ev => {
      this.setState({ body: ev.target.value });
    };

    this.createComment = ev => {
      ev.preventDefault();
      const payload = agent.Comments.create(this.props.slug,
        { body: this.state.body });
      this.setState({ body: '' });
      this.props.onSubmit(payload);
    };
  }

  render() {
    return (
      <div className="comment-form-wrapper">
        <form className="comment-form" onSubmit={this.createComment}>
          <div className="comment-form-body">
            <textarea
              className="comment-textarea"
              placeholder="Write a comment..."
              value={this.state.body}
              onChange={this.setBody}
              rows="3">
            </textarea>
          </div>
          <div className="comment-form-footer">
            <div className="comment-author-img">
              <UserAvatar username={this.props.currentUser.username} image={this.props.currentUser.image} size="sm" />
            </div>
            <button
              className="post-comment-btn"
              type="submit">
              Post Comment
            </button>
          </div>
        </form>
        <style>{`
          .comment-form-wrapper {
            margin-bottom: 2rem;
          }

          .comment-form {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.2s;
          }

          .comment-form:focus-within {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
          }

          .comment-form-body {
            padding: 1rem;
          }

          .comment-textarea {
            width: 100%;
            border: none;
            background: transparent;
            resize: vertical;
            font-size: 1rem;
            color: var(--text-main);
            outline: none;
            min-height: 80px;
            font-family: inherit;
          }

          .comment-textarea::placeholder {
            color: var(--text-secondary);
          }

          .comment-form-footer {
            background: var(--bg-hover);
            padding: 0.75rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid var(--border-color);
          }

          .post-comment-btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.5rem 1.2rem;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background 0.2s;
          }

          .post-comment-btn:hover {
            background: var(--primary-hover);
          }
        `}</style>
      </div>
    );
  }
}

export default connect(() => ({}), mapDispatchToProps)(CommentInput);
