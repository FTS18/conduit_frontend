import React from 'react';
import { Link } from 'react-router-dom';
import agent from '../agent';
import UserAvatar from './UserAvatar';

class CommentThread extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      editText: props.comment.body,
      showReplies: false,
      replies: []
    };
  }

  handleEdit = () => {
    const { comment } = this.props;
    agent.Comments.update(comment.slug, comment.id, this.state.editText).then(() => {
      this.setState({ isEditing: false });
      this.props.onCommentUpdated();
    });
  };

  handleDelete = () => {
    if (window.confirm('Delete this comment?')) {
      agent.Comments.delete(this.props.comment.slug, this.props.comment.id).then(() => {
        this.props.onCommentDeleted();
      });
    }
  };

  toggleReplies = () => {
    this.setState({ showReplies: !this.state.showReplies });
  };

  render() {
    const { comment, currentUser } = this.props;
    const { isEditing, editText, showReplies } = this.state;
    const isAuthor = currentUser && currentUser.username === comment.author.username;

    return (
      <div className="comment-thread">
        <div className="comment-card">
          <div className="comment-header">
            <Link to={`/@${comment.author.username}`} className="author-link">
              <UserAvatar username={comment.author.username} image={comment.author.image} size="sm" />
              <span className="author-name">{comment.author.username}</span>
            </Link>
            <span className="comment-date">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="comment-body">
            {isEditing ? (
              <div className="edit-form">
                <textarea
                  value={editText}
                  onChange={(e) => this.setState({ editText: e.target.value })}
                  className="edit-textarea"
                />
                <div className="edit-actions">
                  <button onClick={this.handleEdit} className="btn-save">Save</button>
                  <button onClick={() => this.setState({ isEditing: false })} className="btn-cancel">Cancel</button>
                </div>
              </div>
            ) : (
              <p>{comment.body}</p>
            )}
          </div>

          {isAuthor && !isEditing && (
            <div className="comment-actions">
              <button onClick={() => this.setState({ isEditing: true })} className="btn-edit">Edit</button>
              <button onClick={this.handleDelete} className="btn-delete">Delete</button>
            </div>
          )}
        </div>

        <style>{`
          .comment-thread {
            margin-bottom: 1.5rem;
          }

          .comment-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 1rem;
          }

          .comment-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }

          .author-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
          }

          .author-name {
            color: var(--text-main);
            font-weight: 600;
            font-size: 0.9rem;
          }

          .comment-date {
            color: var(--text-light);
            font-size: 0.85rem;
            margin-left: auto;
          }

          .comment-body p {
            margin: 0 0 1rem 0;
            color: var(--text-main);
            line-height: 1.6;
          }

          .edit-form {
            margin-bottom: 1rem;
          }

          .edit-textarea {
            width: 100%;
            min-height: 100px;
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            font-family: inherit;
            font-size: 0.9rem;
            resize: vertical;
            background: var(--bg-card);
            color: var(--text-main);
          }

          .edit-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
          }

          .btn-edit, .btn-delete, .btn-save, .btn-cancel {
            padding: 0.4rem 0.8rem;
            border: none;
            border-radius: 4px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-edit {
            background: var(--primary);
            color: var(--bg-body);
          }

          .btn-edit:hover {
            background: var(--primary-hover);
          }

          .btn-delete {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
          }

          .btn-delete:hover {
            background: var(--bg-hover);
            color: var(--primary);
            border-color: var(--primary);
          }

          .btn-save {
            background: var(--primary);
            color: var(--bg-body);
          }

          .btn-cancel {
            background: var(--secondary);
            color: var(--text-main);
          }

          .comment-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
          }
        `}</style>
      </div>
    );
  }
}

export default CommentThread;
