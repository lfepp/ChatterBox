import React from 'react';
import { ListGroupItem } from 'react-bootstrap';

const ChatMessage = props => {
  const date = new Date(props.timestamp);

  return (
    <ListGroupItem bsStyle={props.bsStyle}>
      {props.content}
      <small style={{ fontSize: '65%' }}>  ~  {`${date.toLocaleDateString('en-US')} at ${date.toLocaleTimeString('en-US')}`}</small>
    </ListGroupItem>
  );
};

export default ChatMessage;
