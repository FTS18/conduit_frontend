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
            background: white;
            border: 1px solid #e1e4e8;
            border-radius: 4px;
            padding: 1rem;
          }

          .dark-theme .comment-card {
            background: #1a1a1a;
            border-color: #333;
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
            color: #5cb85c;
            font-weight: 600;
            font-size: 0.9rem;
          }

          .comment-date {
            color: #999;
            font-size: 0.85rem;
            margin-left: auto;
          }

          .dark-theme .comment-date {
            color: #888;
          }

          .comment-body p {
            margin: 0 0 1rem 0;
            color: #373a3c;
            line-height: 1.6;
          }

          .dark-theme .comment-body p {
            color: #e0e0e0;
          }

          .edit-form {
            margin-bottom: 1rem;
          }

          .edit-textarea {
            width: 100%;
            min-height: 100px;
            padding: 0.75rem;
            border: 1px solid #e1e4e8;
            border-radius: 4px;
            font-family: inherit;
            font-size: 0.9rem;
            resize: vertical;
          }

          .dark-theme .edit-textarea {
            background: #222;
            border-color: #333;
            color: #e0e0e0;
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
            background: #5cb85c;
            color: white;
          }

          .btn-edit:hover {
            background: #4a9d4a;
          }

          .btn-delete {
            background: #e74c3c;
            color: white;
          }

          .btn-delete:hover {
            background: #c0392b;
          }

          .btn-save {
            background: #5cb85c;
            color: white;
          }

          .btn-cancel {
            background: #e1e4e8;
            color: #373a3c;
          }

          .comment-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e1e4e8;
          }

          .dark-theme .comment-actions {
            border-top-color: #333;
          }
        `}</style>
      </div>
    );
  }
}

export default CommentThread;
