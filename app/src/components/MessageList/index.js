import React from 'react';
import ChatMessage from '../ChatMessage';

const MessageList = ({ messages, isLoggedIn }) => {
  if (messages.length === 0) {
    return (
      <div>
        {isLoggedIn ? null : <p>Please log in to see older messages or respond</p>}
        <p>No new messages...</p>
      </div>
    );
  }

  return (
    <div>
      {isLoggedIn ? null : <h3>Please log in to see older messages or respond</h3>}
      {messages.map((group, index) => (
        <div
          key={`message-group-${index}`}
        >
          <div>
            {group[0].type === 'user_input' &&
              <h4>{group[0].username}</h4>
            }
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
