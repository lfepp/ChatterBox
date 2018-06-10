import React from 'react';
import ChatWindow from '../ChatWindow';

export default class ChatContainer extends React.Component {
  constructor(props) {
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
    this.state = {
      messages: null,
      isLoggedIn: false,
    };
  }

  componentDidMount() {
    socket.on('new message', (data) => {});

    socket.on('user joined', ({ username }) => {});

    socket.on('user left', ({ username }) => {});
  }

  sendMessage(val) {
    if (!this.state.isLoggedIn) {
      socket.emit('sign in or create user', val);
    } else {
      socket.emit('create message', {
        content: val,
      });
    }
  }

  render() {
    this.props.error ?
    <h1>Error! {this.props.error}</h1> :
    return (
      <ChatWindow
        messages={this.state.messages}
        sendMessage={this.sendMessage}
      />
    );
  }
}
