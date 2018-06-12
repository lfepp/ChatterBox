import React from 'react';
import ChatMessage from '../ChatMessage';

const MessageList = ({ messages, isLoggedIn, loggedInUser }) => {
  if (messages.length === 0) {
    return (
      <div>
        {isLoggedIn ? null : <p>Please log in to see older messages or respond</p>}
        <p>No new messages...</p>
      </div>
    );
  }

  return (
    <div className="chat-message-list">
      {isLoggedIn ? null : <h3>Please log in to see older messages or respond</h3>}
      {messages.map((group, index) => (
        <div
          key={`message-group-${index}`}
          className={`chat-message-group${loggedInUser === group[0].userID ? ' chat-message-own-group' : ''}`}
        >
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
      ))}
    </div>
  );
};

export default MessageList;
