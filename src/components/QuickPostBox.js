import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import agent from '../agent';
import UserAvatar from './UserAvatar';

const mapStateToProps = state => ({
    currentUser: state.common.currentUser
});

const QuickPostBox = ({ currentUser }) => {
    const [postText, setPostText] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handlePost = async () => {
        if (!postText.trim() || isPosting) return;

        setIsPosting(true);
        try {
            await agent.Articles.create({
                title: postText.substring(0, 50) + (postText.length > 50 ? '...' : ''),
                description: postText.substring(0, 100),
                body: postText,
                tagList: []
            });
            setPostText('');
            // Refresh the page to show new post
            window.location.reload();
        } catch (err) {
            console.error('Failed to create post:', err);
        } finally {
            setIsPosting(false);
        }
    };

    if (!currentUser) {
        return null;
    }

    return (
        <div className="quick-post-box">
            <div className="quick-post-header">
                <UserAvatar
                    username={currentUser.username}
                    image={currentUser.image}
                    size="md"
                />
                <div className="quick-post-input">
                    <textarea
                        placeholder="What's happening?"
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        maxLength={500}
                    />
                </div>
            </div>
            <div className="quick-post-actions">
                <div className="quick-post-icons">
                    <Link to="/editor" className="quick-post-icon-btn" title="Write full article">
                        <i className="ion-compose"></i>
                    </Link>
                </div>
                <button
                    className="quick-post-btn"
                    onClick={handlePost}
                    disabled={!postText.trim() || isPosting}
                >
                    {isPosting ? 'Posting...' : 'Post'}
                </button>
            </div>
        </div>
    );
};

export default connect(mapStateToProps)(QuickPostBox);
