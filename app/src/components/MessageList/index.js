import React from 'react';
import ChatMessage from '../ChatMessage';

const MessageList = ({ messages, username }) => (
  messages.length === 0 ?
  <p>No messages in this room yet...</p> :
  messages.map(group => (
    <div>
      <h3>{username}</h3>
      <div>
        {group.map(messageData => (
          <ChatMessage
            {...messageData}
          />
        ))}
      </div>
    </div>
  ))
);

export default MessageList;
