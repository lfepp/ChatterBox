import React from 'react';
import socketIOClient from 'socket.io-client';
import ChatWindow from '../ChatWindow';

export default class ChatContainer extends React.Component {
  constructor(props) {
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
    this.appendMessageGroup = this.appendMessageGroup.bind(this);
    this.appendMessageToFinalGroup = this.appendMessageToFinalGroup.bind(this);
    this.state = {
      messages: [],
      isLoggedIn: false,
      loggedInUser: null,
    };

    this.socket = socketIOClient('http://127.0.0.1:18000', { transports: ['websocket', 'polling'] });
  }

  componentDidMount() {
    // Listeners
    this.socket.on('login', ({ username }) => {
      this.setState({
        isLoggedIn: true,
        loggedInUser: username,
      });
    });

    this.socket.on('new message', (data) => {
      const lastMessageGroup = this.state.messages[this.state.messages.length - 1];

      if (data.type === 'automated') {
        if (data.type === lastMessageGroup[0].type) {
          this.appendMessageToFinalGroup(lastMessageGroup, data);
        } else {
          this.appendMessageGroup(data);
        }
      } else if (data.type === 'user_input') {
        if (data.userID === lastMessageGroup[0].userID) {
          this.appendMessageToFinalGroup(lastMessageGroup, data);
        } else {
          this.appendMessageGroup(data);
        }
      }
    });

    this.socket.on('user joined', ({ username }) => {
      this.socket.broadcast.emit('new message', {
        type: 'automated',
        content: `${username} has joined the chat`,
      });
    });

    this.socket.on('user left', ({ username }) => {
      this.socket.broadcast.emit('new message', {
        type: 'automated',
        content: `${username} has left the chat`,
      });
    });

    this.socket.on('error', ({ message, statusCode }) => {
      console.error(`Server error: ${statusCode}, ${message}`);
    });
  }

  appendMessageGroup(data) {
    this.setState({ messages: [...this.state.messages, [data]] });
  }

  appendMessageToFinalGroup(lastMessageGroup, data) {
    lastMessageGroup.push(data);
    const newMessages = [
      ...this.state.messages.slice(0, this.state.messages.length - 1),
      lastMessageGroup,
    ];
    this.setState({ messages: newMessages });
  }

  sendMessage(val) {
    if (!this.state.isLoggedIn) {
      this.socket.emit('sign in or create user', val);
    } else {
      this.socket.emit('create message', {
        content: val,
      });
    }
  }

  render() {
    return (
      this.props.error ?
      (
        <h1>Error! {this.props.error}</h1>
      ) :
      (
        <ChatWindow
          messages={this.state.messages}
          sendMessage={this.sendMessage}
          username={this.state.loggedInUser}
        />
      )
    );
  }
}
