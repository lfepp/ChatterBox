import React from 'react';
import { Panel } from 'react-bootstrap';
import MessageList from '../MessageList';
import MessageEditor from '../MessageEditor';

const ChatWindow = props => (
  <Panel className="chat-window">
    <Panel.Heading className="chat-header">
      <Panel.Title componentClass="h2">{props.roomTitle}</Panel.Title>
    </Panel.Heading>
    <Panel.Body>
      <MessageList
        messages={props.messages}
        isLoggedIn={props.isLoggedIn}
        loggedInUser={props.loggedInUser}
      />
      <MessageEditor
        sendMessage={props.sendMessage}
        getPreviousMessages={props.getPreviousMessages}
      />
    </Panel.Body>
  </Panel>
);

export default ChatWindow;
