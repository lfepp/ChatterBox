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
    };

    this.socket = socketIOClient('http://127.0.0.1:18000', { transports: ['websocket', 'polling'] });
  }

  componentDidMount() {
    this.socket.on('login', ({ username }) => {
      const before = this.state.messages.length > 0 ? this.state.messages[0].created_date : null;
      this.socket.emit('get messages request', { before });

      this.setState({ isLoggedIn: true });
    });

    this.socket.on('get messages response', ({ messages }) => {
      if (messages.length === 0) {
        return;
      }

      const groupedMessages = [];
      messages.forEach((message) => {
        if (groupedMessages.length === 0) {
          groupedMessages.push([message]);
          return;
        }

        const lastMessageGroup = groupedMessages[groupedMessages.length - 1];
        switch (message.type) {
          case 'automated': {
            if (message.type === lastMessageGroup[0].type) {
              groupedMessages[groupedMessages.length - 1].push(message);
            } else {
              groupedMessages.push([message]);
            }
            break;
          }
          case 'user_input': {
            if (message.userID === lastMessageGroup[0].userID) {
              groupedMessages[groupedMessages.length - 1].push(message);
            } else {
              groupedMessages.push([message]);
            }
            break;
          }
          default:
            break;
        }
      });

      let newMessages;
      switch (groupedMessages[groupedMessages.length - 1].type) {
        case 'automated': {
          if (this.state.messages[0].type === 'automated') {
            newMessages = [
              ...groupedMessages.slice(0, groupedMessages.length - 1),
              [
                ...groupedMessages[groupedMessages.length - 1],
                ...this.state.messages[0],
              ],
              ...this.state.messages.slice(1),
            ];
          } else {
            newMessages = [
              ...groupedMessages,
              ...this.state.messages,
            ];
          }
          break;
        }
        case 'user_input': {
          if (groupedMessages[groupedMessages.length - 1].userID === this.state.messages[0].userID) {
            newMessages = [
              ...groupedMessages.slice(0, groupedMessages.length - 1),
              [
                ...groupedMessages[groupedMessages.lenght - 1],
                ...this.state.messages[0],
              ],
              ...this.state.messages.slice(1),
            ];
          } else {
            newMessages = [
              ...groupedMessages,
              ...this.state.messages,
            ];
          }
          break;
        }
        default:
          newMessages = [
            ...groupedMessages,
            ...this.state.messages,
          ];
          break;
      }

      this.setState({ messages: newMessages });
    });

    this.socket.on('new message', (data) => {
      if (this.state.messages.length === 0) {
        this.setState({ messages: [[data]] });
        return;
      }

      const lastMessageGroup = this.state.messages[this.state.messages.length - 1];

      switch (data.type) {
        case 'automated': {
          if (data.type === lastMessageGroup[0].type) {
            this.appendMessageToFinalGroup(lastMessageGroup, data);
          } else {
            this.appendMessageGroup(data);
          }
          break;
        }
        case 'user_input': {
          if (data.userID === lastMessageGroup[0].userID) {
            this.appendMessageToFinalGroup(lastMessageGroup, data);
          } else {
            this.appendMessageGroup(data);
          }
          break;
        }
        default:
          break;
      }
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
          isLoggedIn={this.state.isLoggedIn}
        />
      )
    );
  }
}
