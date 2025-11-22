import React from 'react';
import { connect } from 'react-redux';
import agent from '../agent';
import {
  ARTICLE_BOOKMARKED,
  ARTICLE_UNBOOKMARKED
} from '../constants/actionTypes';

const mapDispatchToProps = dispatch => ({
  bookmark: slug => dispatch({
    type: ARTICLE_BOOKMARKED,
    payload: agent.Articles.bookmark(slug)
  }),
  unbookmark: slug => dispatch({
    type: ARTICLE_UNBOOKMARKED,
    payload: agent.Articles.unbookmark(slug)
  })
});

class BookmarkButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  handleClick = async (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    
    if (this.state.isLoading || !this.props.currentUser) {
      return;
    }

    this.setState({ isLoading: true });
    
    try {
      if (this.props.article.bookmarked) {
        await this.props.unbookmark(this.props.article.slug);
      } else {
        await this.props.bookmark(this.props.article.slug);
      }
    } catch (error) {
      console.error('Bookmark action failed:', error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { article, currentUser } = this.props;
    const { isLoading } = this.state;
    
    if (!currentUser) {
      return null;
    }

    const buttonClass = article.bookmarked ? 'btn-pill btn-pill-primary' : 'btn-pill btn-pill-outline';

    return (
      <button
        className={buttonClass}
        onClick={this.handleClick}
        disabled={isLoading}>
        <i className="ion-bookmark"></i>
        {isLoading ? '...' : (article.bookmarked ? 'Unbookmark' : 'Bookmark')}
      </button>
    );
  }
}

export default connect(state => ({
  currentUser: state.common.currentUser
}), mapDispatchToProps)(BookmarkButton);
