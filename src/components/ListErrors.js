import React from 'react';

class ListErrors extends React.Component {
  render() {
    const errors = this.props.errors;
    if (errors) {
      return (
        <div>
          <ul className="error-messages">
            {
              Object.keys(errors).map(key => {
                return (
                  <li key={key}>
                    {key} {errors[key]}
                  </li>
                );
              })
            }
          </ul>
          <style>{`
            .error-messages {
              list-style: none;
              padding: 1rem;
              margin-bottom: 1.5rem;
              background: #f8d7da;
              border: 1px solid #f5c6cb;
              border-radius: 4px;
              color: #721c24;
            }

            .error-messages li {
              margin-bottom: 0.5rem;
              font-size: 0.95rem;
            }

            .error-messages li:last-child {
              margin-bottom: 0;
            }

            .dark-theme .error-messages {
              background: #3d2426;
              border-color: #5a3a3d;
              color: #f8d7da;
            }
          `}</style>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default ListErrors;
