import React from 'react';

import './MessageBox.css'

export default class MessageBox extends React.Component {
  constructor(props) {
    super(props);

    this.submitMessage = this.submitMessage.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);

    this.state = this.initialState();
  }

  initialState() {
    return { message: ''};
  }

  setMessage(message) {
    this.setState({
      message
    })
  }

  submitMessage(ev) {
    ev.preventDefault();
    this.props.onMessageSubmit(this.state.message);
    this.reset();
  }

  handleKeyPress(ev) {
    if (ev.key !== 'Enter') {
      return;
    }

    this.submitMessage(ev);
  }

  reset() {
    this.setState(this.initialState());
  }

  render() {
    return (
      <div className="message-box">
        <form onSubmit={ this.submitMessage } onKeyPress={ this.handleKeyPress }>
          <textarea
            value={this.state.message}
            onChange={ e =>this.setMessage(e.target.value) }>
          </textarea>
          <button>Enviar</button>
        </form>
      </div>
    )
  }
}