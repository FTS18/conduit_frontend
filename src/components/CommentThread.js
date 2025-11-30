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
      showReplies: true,
      replies: props.comment.replies || [],
      isAuthorReply: this.isAuthorReply(props)
    };
  }

  isAuthorReply = (props) => {
    const { comment, articleAuthor, currentUser } = props;
    return articleAuthor && comment.author.username === articleAuthor;
  }

  handleEdit = () => {
    const { comment } = this.props;
    agent.Comments.update(comment.slug, comment.id, this.state.editText).then(() => {
      this.setState({ isEditing: false });
      this.props.onCommentUpdated?.();
    });
  };

  handleDelete = () => {
    if (window.confirm('Delete this comment?')) {
      agent.Comments.delete(this.props.comment.slug, this.props.comment.id).then(() => {
        this.props.onCommentDeleted?.();
      });
    }
  };

  handleVote = (value) => {
    const { comment } = this.props;
    const endpoint = value > 0 ? agent.Comments.upvote : agent.Comments.downvote;
    endpoint(comment.id).then(() => {
      this.props.onCommentUpdated?.();
    });
  };

  toggleReplies = () => {
    this.setState({ showReplies: !this.state.showReplies });
  };

  render() {
    const { comment, currentUser, articleAuthor, depth = 0 } = this.props;
    const { isEditing, editText, showReplies, replies, isAuthorReply } = this.state;
    const isAuthor = currentUser && currentUser.username === comment.author.username;
    const maxDepth = 3;
    const canReply = depth < maxDepth;

    return (
      <div className={`comment-thread depth-${Math.min(depth, maxDepth)}`}>
        <div className="comment-card">
          <div className="comment-header">
            <div className="author-info">
              <Link to={`/@${comment.author.username}`} className="author-link">
                <UserAvatar username={comment.author.username} image={comment.author.image} size="sm" />
                <span className="author-name">{comment.author.username}</span>
              </Link>
              {isAuthorReply && <span className="author-badge">Author</span>}
            </div>
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

          <div className="comment-footer">
            <div className="comment-votes">
              <button 
                onClick={() => this.handleVote(1)} 
                className="btn-vote upvote"
                title="Upvote"
              >
                👍 {comment.upvotes || 0}
              </button>
              <button 
                onClick={() => this.handleVote(-1)} 
                className="btn-vote downvote"
                title="Downvote"
              >
                👎 {comment.downvotes || 0}
              </button>
            </div>

            {isAuthor && !isEditing && (
              <div className="comment-actions">
                <button onClick={() => this.setState({ isEditing: true })} className="btn-edit">Edit</button>
                <button onClick={this.handleDelete} className="btn-delete">Delete</button>
              </div>
            )}
          </div>
        </div>

        {replies && replies.length > 0 && (
          <div className="replies-section">
            <button onClick={this.toggleReplies} className="toggle-replies">
              {showReplies ? '▼' : '▶'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
            {showReplies && (
              <div className="replies-list">
                {replies.map(reply => (
                  <CommentThread
                    key={reply.id}
                    comment={reply}
                    currentUser={currentUser}
                    articleAuthor={articleAuthor}
                    depth={depth + 1}
                    onCommentUpdated={this.props.onCommentUpdated}
                    onCommentDeleted={this.props.onCommentDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <style>{`
          .comment-thread {
            margin-bottom: 1.5rem;
          }

          .comment-thread.depth-1 {
            margin-left: 2rem;
          }

          .comment-thread.depth-2 {
            margin-left: 4rem;
          }

          .comment-thread.depth-3 {
            margin-left: 6rem;
          }

          .comment-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 1rem;
            transition: all 0.2s;
          }

          .comment-card:hover {
            box-shadow: var(--shadow-sm);
            border-color: var(--primary);
          }

          .comment-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
            gap: 1rem;
          }

          .author-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
            min-width: 0;
          }

          .author-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            flex: 1;
            min-width: 0;
          }

          .author-name {
            color: var(--text-main);
            font-weight: 600;
            font-size: 0.9rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .author-badge {
            display: inline-block;
            padding: 0.2rem 0.5rem;
            background: var(--primary);
            color: var(--bg-body);
            font-size: 0.7rem;
            border-radius: 3px;
            font-weight: 600;
            white-space: nowrap;
          }

          .comment-date {
            color: var(--text-light);
            font-size: 0.85rem;
            white-space: nowrap;
          }

          .comment-body p {
            margin: 0 0 1rem 0;
            color: var(--text-main);
            line-height: 1.6;
            word-break: break-word;
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

          .comment-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
          }

          .comment-votes {
            display: flex;
            gap: 0.5rem;
          }

          .btn-vote {
            padding: 0.4rem 0.8rem;
            border: 1px solid var(--border-color);
            background: var(--bg-hover);
            color: var(--text-secondary);
            border-radius: 4px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
          }

          .btn-vote:hover {
            background: var(--primary);
            color: var(--bg-body);
            border-color: var(--primary);
          }

          .comment-actions {
            display: flex;
            gap: 0.5rem;
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
            opacity: 0.8;
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

          .replies-section {
            margin-top: 1rem;
            margin-left: 1rem;
          }

          .toggle-replies {
            background: none;
            border: none;
            color: var(--primary);
            cursor: pointer;
            font-size: 0.9rem;
            padding: 0.5rem 0;
            transition: color 0.2s;
          }

          .toggle-replies:hover {
            color: var(--text-main);
          }

          .replies-list {
            margin-top: 0.75rem;
          }

          @media (max-width: 768px) {
            .comment-thread.depth-1 {
              margin-left: 1rem;
            }

            .comment-thread.depth-2 {
              margin-left: 2rem;
            }

            .comment-thread.depth-3 {
              margin-left: 3rem;
            }

            .comment-card {
              padding: 0.75rem;
            }

            .comment-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .comment-footer {
              flex-direction: column;
              align-items: flex-start;
            }

            .comment-votes {
              width: 100%;
            }

            .btn-vote {
              flex: 1;
            }

            .comment-actions {
              width: 100%;
            }

            .btn-edit, .btn-delete {
              flex: 1;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default CommentThread;
