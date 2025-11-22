import React from 'react';
import agent from '../agent';

class ContentModeration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      reportType: 'spam',
      reason: '',
      submitted: false
    };
  }

  handleReport = () => {
    const { reportType, reason } = this.state;
    const { articleSlug, commentId } = this.props;

    agent.Moderation.report({
      type: commentId ? 'comment' : 'article',
      targetId: commentId || articleSlug,
      reportType,
      reason
    }).then(() => {
      this.setState({ submitted: true });
      setTimeout(() => {
        this.setState({ showModal: false, submitted: false, reason: '', reportType: 'spam' });
      }, 2000);
    });
  };

  render() {
    const { showModal, reportType, reason, submitted } = this.state;

    return (
      <div className="content-moderation">
        <button 
          className="btn-report"
          onClick={() => this.setState({ showModal: true })}
          title="Report content"
        >
          🚩 Report
        </button>

        {showModal && (
          <div className="modal-overlay" onClick={() => this.setState({ showModal: false })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Report Content</h3>
              
              {submitted ? (
                <p className="success">Thank you! Your report has been submitted.</p>
              ) : (
                <div>
                  <div className="form-group">
                    <label>Report Type:</label>
                    <select
                      value={reportType}
                      onChange={(e) => this.setState({ reportType: e.target.value })}
                      className="form-select"
                    >
                      <option value="spam">Spam</option>
                      <option value="harassment">Harassment</option>
                      <option value="misinformation">Misinformation</option>
                      <option value="inappropriate">Inappropriate Content</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Additional Details:</label>
                    <textarea
                      value={reason}
                      onChange={(e) => this.setState({ reason: e.target.value })}
                      placeholder="Please provide details..."
                      className="form-textarea"
                      rows="4"
                    />
                  </div>

                  <div className="modal-actions">
                    <button onClick={this.handleReport} className="btn-submit">Submit Report</button>
                    <button onClick={() => this.setState({ showModal: false })} className="btn-cancel">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <style>{`
          .btn-report {
            padding: 0.4rem 0.8rem;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-report:hover {
            background: #c0392b;
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
          }

          .modal-content {
            background: white;
            border-radius: 8px;
            padding: 2rem;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .dark-theme .modal-content {
            background: #1a1a1a;
            color: #e0e0e0;
          }

          .modal-content h3 {
            margin-top: 0;
            color: #373a3c;
          }

          .dark-theme .modal-content h3 {
            color: #e0e0e0;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #373a3c;
            font-size: 0.9rem;
          }

          .dark-theme .form-group label {
            color: #e0e0e0;
          }

          .form-select, .form-textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #e1e4e8;
            border-radius: 4px;
            font-family: inherit;
            font-size: 0.9rem;
          }

          .dark-theme .form-select, .dark-theme .form-textarea {
            background: #222;
            border-color: #333;
            color: #e0e0e0;
          }

          .modal-actions {
            display: flex;
            gap: 0.75rem;
            margin-top: 1.5rem;
          }

          .btn-submit {
            flex: 1;
            padding: 0.75rem;
            background: #5cb85c;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
          }

          .btn-submit:hover {
            background: #4a9d4a;
          }

          .btn-cancel {
            flex: 1;
            padding: 0.75rem;
            background: #e1e4e8;
            color: #373a3c;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
          }

          .success {
            color: #5cb85c;
            text-align: center;
            padding: 1rem;
          }
        `}</style>
      </div>
    );
  }
}

export default ContentModeration;
