import React from 'react';
import agent from '../../agent';

class Tags extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTags: []
    };
  }

  handleTagClick = (ev, tag) => {
    ev.preventDefault();
    const { selectedTags } = this.state;
    const isSelected = selectedTags.includes(tag);

    let newSelectedTags;
    if (isSelected) {
      newSelectedTags = selectedTags.filter(t => t !== tag);
    } else {
      newSelectedTags = [...selectedTags, tag];
    }

    this.setState({ selectedTags: newSelectedTags });

    if (newSelectedTags.length > 0) {
      const tagsQuery = newSelectedTags.join(',');
      const mergedPayload = () => {
        return Promise.all(newSelectedTags.map(t => agent.Articles.byTag(t))).then(results => {
          const articles = [];
          const seen = new Set();
          results.forEach(result => {
            result.articles.forEach(article => {
              if (!seen.has(article.slug)) {
                seen.add(article.slug);
                articles.push(article);
              }
            });
          });
          return { articles };
        });
      };
      this.props.onClickTag(tagsQuery, page => mergedPayload(), mergedPayload());
    } else {
      this.props.onClickTag(null, agent.Articles.all, agent.Articles.all());
    }
  }

  render() {
    const { tags } = this.props;
    const { selectedTags } = this.state;

    if (tags && tags.length > 0) {
      return (
        <div className="tag-list">
          <style>{`
            .tag-active {
              background-color: #000000 !important;
              color: white !important;
              border-color: #000000 !important;
            }
            .tag-active:hover {
              background-color: #333333 !important;
              border-color: #333333 !important;
            }
            .dark-theme .tag-active {
              background-color: #ffffff !important;
              color: black !important;
              border-color: #ffffff !important;
            }
            .dark-theme .tag-active:hover {
              background-color: #cccccc !important;
              border-color: #cccccc !important;
            }
          `}</style>
          {
            tags.map(tag => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  className={`tag-default tag-pill ${isActive ? 'tag-active' : ''}`}
                  key={tag}
                  onClick={(ev) => this.handleTagClick(ev, tag)}>
                  {tag}
                </button>
              );
            })
          }
        </div>
      );
    } else {
      return (
        <div style={{ color: '#999', fontSize: '0.9rem' }}>Loading Tags...</div>
      );
    }
  }
}

export default Tags;
