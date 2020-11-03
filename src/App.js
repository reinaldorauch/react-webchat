import React from 'react';
import { ChatEventStream, getChatMessagesAndMembers, postMessage } from './lib/chat';

import './App.css';

import Chat from './Chat';
import MemberList from './MemberList';
import MessageBox from './MessageBox';
import LoadingSpinner from './LoadingSpinner';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      messages: [],
      members: [],
      currentMember: props.member
    };

    this.handleMessageSubmit = this.handleMessageSubmit.bind(this);

    getChatMessagesAndMembers(props.id)
      .then(({messages, members}) => {
        this.setState({messages, members, loading: false});
      })
      .then(() => {
        this.stream = new ChatEventStream(props.id, props.member);
        this.stream.on(ChatEventStream.EVENT_OK, () => {
          this.setState({
            messages: [{sender: 'System', message: 'Online'}],
            members: [],
            currentMember: this.state.currentMember,
          });
        });
        this.stream.on(ChatEventStream.EVENT_MESSAGE, message => {
          this.setState({
            messages: [...this.state.messages, message],
            members: [...this.state.members],
            currentMember: this.state.currentMember
          });
        });
        this.stream.on(ChatEventStream.EVENT_MEMBER_CHANGE, members => {
          this.setState({
            messages: [...this.state.messages],
            members: members,
            currentMember: this.state.currentMember
          });
        });
      });
  }

  componentWillUnmount() {
    if (this.stream && this.stream.open) {
      this.stream.close();
    }
  }

  handleMessageSubmit(message) {
    postMessage(this.props.id, message, this.state.currentMember);
  }
  
  render() {
    const { messages, members, loading } = this.state;

    if (loading) {
      return (
        <div className="app">
          <LoadingSpinner />
        </div>
      )
    }

    return (
      <div className="app">
        <Chat messages={messages} currentMember={this.state.currentMember} />
        <MemberList members={members} />
        <MessageBox onMessageSubmit={ this.handleMessageSubmit }/>
      </div>
    );
  }
}
