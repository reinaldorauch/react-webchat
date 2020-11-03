import React from 'react';

export default class Member extends React.Component {
  render() {
    return (
      <div className="member">
        <i className="fa fa-user"></i>
        {this.props.member}
      </div>
    );
  }
}