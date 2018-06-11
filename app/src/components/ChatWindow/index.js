import React from 'react';
import MessageList from '../MessageList';
import MessageEditor from '../MessageEditor';

const ChatWindow = props => (
  <div>
    <h2>General Chat</h2>
    <MessageList
      messages={props.messages}
      username={props.username}
      isLoggedIn={props.isLoggedIn}
    />
    <MessageEditor
      sendMessage={props.sendMessage}
    />
  </div>
);

export default ChatWindow;
