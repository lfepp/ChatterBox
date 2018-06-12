import React from 'react';
import MessageList from '../MessageList';
import MessageEditor from '../MessageEditor';

const ChatWindow = props => (
  <div className="chat-window">
    <h2>General Chat</h2>
    <MessageList
      messages={props.messages}
      isLoggedIn={props.isLoggedIn}
      loggedInUser={props.loggedInUser}
    />
    <MessageEditor
      sendMessage={props.sendMessage}
      getPreviousMessages={props.getPreviousMessages}
    />
  </div>
);

export default ChatWindow;
