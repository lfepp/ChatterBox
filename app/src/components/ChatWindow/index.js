import React from 'react';
import { Panel, Grid, Row, Col } from 'react-bootstrap';
import MessageList from '../MessageList';
import MessageEditor from '../MessageEditor';
import UserList from '../UserList';

const ChatWindow = props => (
  <Panel>
    <Panel.Heading>
      <Panel.Title componentClass="h2">{props.roomTitle}</Panel.Title>
    </Panel.Heading>
    <Panel.Body>
      <Grid fluid={true}>
        <Row>
          <Col sm={8}>
            <Panel>
              <Panel.Body>
                <MessageList
                  messages={props.messages}
                  isLoggedIn={props.isLoggedIn}
                  loggedInUser={props.loggedInUser}
                />
              </Panel.Body>
            </Panel>
            <MessageEditor
              sendMessage={props.sendMessage}
              getPreviousMessages={props.getPreviousMessages}
              canGetPreviousMessages={props.canGetPreviousMessages}
              isLoggedIn={props.isLoggedIn}
            />
          </Col>
          <Col sm={4}>
            <UserList
              users={props.allUsers}
              isLoggedIn={props.isLoggedIn}
              loggedInUser={props.loggedInUser}
            />
          </Col>
        </Row>
      </Grid>
    </Panel.Body>
  </Panel>
);

export default ChatWindow;
