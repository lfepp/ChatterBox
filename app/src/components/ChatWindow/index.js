import React from 'react';
import MessageList from '../MessageList';
import MessageEditor from '../MessageEditor';

const ChatWindow = props => (
  <div>
    <h2>General Chat</h2>
    <MessageList
      messages={props.messages}
      isLoggedIn={props.isLoggedIn}
    />
    <MessageEditor
      sendMessage={props.sendMessage}
      getPreviousMessages={props.getPreviousMessages}
    />
  </div>
);

export default ChatWindow;
