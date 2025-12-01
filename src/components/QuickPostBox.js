import React, { useState } from 'react';
import { connect } from 'react-redux';
import agent from '../agent';

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
            // Reload home page to show new post
            window.location.hash = '#/';
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
            <textarea
                className="quick-post-textarea"
                placeholder="What's happening?"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                maxLength={500}
            />
            <button
                className="quick-post-btn"
                onClick={handlePost}
                disabled={!postText.trim() || isPosting}
            >
                {isPosting ? 'Posting...' : 'Post'}
            </button>
        </div>
    );
};

export default connect(mapStateToProps)(QuickPostBox);
