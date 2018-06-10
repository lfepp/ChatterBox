import React from 'react';

const ChatMessage = props => {
  const date = new Date(props.timestamp);

  return (
    <div>
      <p>{props.content}</p>
      <p>{`${date.toLocaleDateString('en-US')} at ${date.toLocaleTimeString('en-US')}`}</p>
    </div>
  );
};

export default ChatMessage;
