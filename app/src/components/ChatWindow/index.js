import React from 'react';
import MessageList from '../MessageList';
import MessageEditor from '../MessageEditor';

const ChatWindow = props => (
  <div>
    <h2>General Chat</h2>
    props.isConnecting ?
    <h3>Connecting...</h3> :
    (
      <MessageList
        messages={props.messages}
      />
      <MessageEditor
      sendMessage={props.sendMessage}
      />
    )
  </div>
);

export default ChatWindow;
