import React from 'react';
import { ListGroupItem } from 'react-bootstrap';

const ChatMessage = props => {
  const date = new Date(props.timestamp);

  return (
    <ListGroupItem className="chat-message">
      {props.content}<small className="chat-message-date"> - {`${date.toLocaleDateString('en-US')} at ${date.toLocaleTimeString('en-US')}`}</small>
    </ListGroupItem>
  );
};

export default ChatMessage;
