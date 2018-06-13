import React from 'react';
import MessageInput from '../MessageInput';
import MessageEditorToolbar from '../MessageEditorToolbar';

export default class MessageEditor extends React.Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.state = {
      inputValue: '',
    };
  }

  handleInputChange(e) {
    this.setState({
      inputValue: e.target.value,
    });
  }

  sendMessage() {
    this.props.sendMessage(this.state.inputValue);
    this.setState({ inputValue: '' });
  }

  render() {
    return (
      <div>
        <MessageInput
          value={this.state.inputValue}
          handleChange={this.handleInputChange}
          isLoggedIn={this.props.isLoggedIn}
        />
        <MessageEditorToolbar
          sendMessage={this.sendMessage}
          isLoggedIn={this.props.isLoggedIn}
        />
      </div>
    );
  }
}
