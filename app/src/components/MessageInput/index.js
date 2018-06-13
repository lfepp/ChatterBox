import React from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

const MessageInput = props => (
  <FormGroup controlId="chatMessageInputTextarea">
    <ControlLabel>{props.isLoggedIn ? 'Enter a message' : 'Username'}</ControlLabel>
    {
      props.isLoggedIn ?
      (
        <FormControl
          componentClass="textarea"
          autoFocus={true}
          value={props.value}
          onChange={props.handleChange}
        />
      ) :
      (
        <FormControl
          componentClass="input"
          autoFocus={true}
          value={props.value}
          onChange={props.handleChange}
          style={{
            maxWidth: 140,
          }}
        />
      )
    }


  </FormGroup>
);

export default MessageInput;
