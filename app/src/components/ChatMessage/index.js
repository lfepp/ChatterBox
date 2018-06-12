import React from 'react';

const ChatMessage = props => {
  const date = new Date(props.timestamp);

  return (
    <div className="chat-message">
      <p className="chat-message-content">{props.content}</p>
      <p className="chat-message-date">{`${date.toLocaleDateString('en-US')} at ${date.toLocaleTimeString('en-US')}`}</p>
    </div>
  );
};

export default ChatMessage;
