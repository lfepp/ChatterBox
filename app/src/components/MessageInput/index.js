import React from 'react';

const MessageInput = props => (
  <textarea
    autoFocus={true}
    value={props.value}
    onChange={props.handleChange}
  />
);

export default MessageInput;
