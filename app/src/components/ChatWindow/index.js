import React from 'react';
import { Grid, Row } from 'react-bootstrap';
import MessageList from '../MessageList';
import MessageEditor from '../MessageEditor';

const ChatWindow = props => (
  <Grid className="chat-window">
    <Row className="chat-header">
      <h2>{props.roomTitle}</h2>
    </Row>
    <Row>
      <MessageList
        messages={props.messages}
        isLoggedIn={props.isLoggedIn}
        loggedInUser={props.loggedInUser}
      />
      <MessageEditor
        sendMessage={props.sendMessage}
        getPreviousMessages={props.getPreviousMessages}
      />
    </Row>
  </Grid>
);

export default ChatWindow;
