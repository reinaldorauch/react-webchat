import React from 'react';

import './ChatMessage.css';

export default class ChatMessage extends React.Component {
  render() {
    const cssClass = this.props.sender === this.props.currentMember 
      ? 'chat-message sender-me' 
      : 'chat-message sender-other';
    return (
      <div className={cssClass}>
        <div className="sender">{this.props.sender}</div>
        <div>{this.props.message}</div>
      </div>
    );
  }
}