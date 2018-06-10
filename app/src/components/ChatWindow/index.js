import React from 'react';
import MessageList from '../MessageList';
import MessageEditor from '../MessageEditor';

const ChatWindow = props => (
  <div>
    <h2>General Chat</h2>
    <MessageList
      messages={props.messages}
      username={props.username}
    />
    <MessageEditor
      sendMessage={props.sendMessage}
    />
  </div>
);

export default ChatWindow;
