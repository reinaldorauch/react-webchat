import React from 'react';
import ChatMessage from './ChatMessage';

import './Chat.css'

export default class Chat extends React.Component {
  render() {
    const messages = this.props.messages.map(
      ({message, member}, index) =>
        <ChatMessage key={index} message={message} sender={member} currentMember={this.props.currentMember} />
    );
    return (
      <div className="chat">
        {messages}
      </div>
    );
  }
}