import React from 'react';
import ChatMessage from '../ChatMessage';

const MessageList = ({ messages, username, isLoggedIn }) => {
  if (messages.length === 0) {
    return (
      <div>
        {isLoggedIn ? <p>Please log in to see older messages or respond</p> : null}
        <p>No new messages...</p>
      </div>
    );
  }

  return (
    <div>
      {messages.map((group, index) => (
        <div
          key={`message-group-${index}`}
        >
          {isLoggedIn ? <h3>{username}</h3> : <h3>Please log in to see older messages or respond</h3>}
          <div>
            {group.map((messageData, i) => (
              <ChatMessage
                key={`group-${index}-message-${messageData.timestamp}-${i}`}
                {...messageData}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
