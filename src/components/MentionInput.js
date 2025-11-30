import React, { useState, useRef, useEffect } from 'react';
import agent from '../agent';

const MentionInput = ({ value, onChange, onSubmit, placeholder = 'Write a comment...', buttonText = 'Post' }) => {
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [allUsers, setAllUsers] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await agent.Profile.getAllUsers();
        setAllUsers(result.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const text = e.target.value;
    onChange(text);

    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = text.substring(lastAtIndex + 1);
      if (afterAt && !afterAt.includes(' ')) {
        const suggestions = allUsers
          .filter(u => u.username.toLowerCase().includes(afterAt.toLowerCase()))
          .map(u => u.username)
          .slice(0, 5);
        setMentionSuggestions(suggestions);
        setShowMentions(suggestions.length > 0);
        setMentionIndex(-1);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (username) => {
    const text = value;
    const lastAtIndex = text.lastIndexOf('@');
    const beforeAt = text.substring(0, lastAtIndex);
    const newText = beforeAt + '@' + username + ' ';
    onChange(newText);
    setShowMentions(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (!showMentions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % mentionSuggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (mentionIndex >= 0) {
          insertMention(mentionSuggestions[mentionIndex]);
        }
        break;
      case 'Escape':
        setShowMentions(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="mention-input-wrapper">
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="mention-textarea"
          rows="3"
        />
        {showMentions && mentionSuggestions.length > 0 && (
          <div className="mention-suggestions">
            {mentionSuggestions.map((user, idx) => (
              <div
                key={user}
                className={`mention-item ${mentionIndex === idx ? 'selected' : ''}`}
                onClick={() => insertMention(user)}
              >
                @{user}
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => onSubmit(value)} className="mention-submit-btn">
        {buttonText}
      </button>

      <style>{`
        .mention-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mention-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e1e4e8;
          border-radius: 4px;
          font-family: inherit;
          font-size: 0.95rem;
          resize: vertical;
          background: white;
          color: #333;
        }

        .dark-theme .mention-textarea {
          background: #1a1a1a;
          color: #e0e0e0;
          border-color: #333;
        }

        .mention-textarea:focus {
          outline: none;
          border-color: #000000;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
        }

        .mention-suggestions {
          position: absolute;
          bottom: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e1e4e8;
          border-radius: 4px 4px 0 0;
          max-height: 150px;
          overflow-y: auto;
          z-index: 100;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
        }

        .dark-theme .mention-suggestions {
          background: #1a1a1a;
          border-color: #333;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
        }

        .mention-item {
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #f0f0f0;
          color: #333;
        }

        .dark-theme .mention-item {
          border-bottom-color: #333;
          color: #e0e0e0;
        }

        .mention-item:hover,
        .mention-item.selected {
          background: #f0f0f0;
        }

        .dark-theme .mention-item:hover,
        .dark-theme .mention-item.selected {
          background: #2a2a2a;
        }

        .mention-submit-btn {
          padding: 0.5rem 1rem;
          background: #000000;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
          align-self: flex-end;
        }

        .mention-submit-btn:hover {
          background: #333333;
        }

        .mention-submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default MentionInput;
