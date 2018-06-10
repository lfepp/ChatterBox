import React from 'react';

const MessageInput = props => (
  <textarea
    autofocus={true}
    value={props.value}
    onChange={props.handleChange}
  />
);

export default MessageInput;
