import React from 'react';
import { Alert, ListGroup, Button } from 'react-bootstrap';
import ChatMessage from '../ChatMessage';

const MessageList = ({ messages, isLoggedIn, loggedInUser, canGetPreviousMessages, getPreviousMessages }) => {
  const SeeMoreButton = () => (
    canGetPreviousMessages ?
    (
      <Button block onClick={getPreviousMessages}>
        See All Messages
      </Button>
    ) :
    null
  );

  if (messages.length === 0) {
    return (
      <div>
        {
          isLoggedIn ?
          (
            <div>
              <SeeMoreButton />
              <Alert bsStyle="info">
                <p>No new messages...</p>
              </Alert>
            </div>
          ) :
          (
            <Alert bsStyle="info">
              <p>Please log in to see older messages or respond</p>
              <p><small>Submit your username to create an account or sign in</small></p>
            </Alert>
          )
        }
      </div>
    );
  }

  return (
    <div>
      {
        isLoggedIn ?
        <SeeMoreButton /> :
        (
          <Alert bsStyle="info">
            <p>Please log in to see older messages or respond</p>
            <p><small>Submit your username to create an account or sign in</small></p>
          </Alert>
        )
      }
      {messages.map((group, index) => (
        <div
          key={`message-group-${index}`}
        >
          {group[0].type === 'user_input' &&
            <h4>{group[0].username}</h4>
          }
          <ListGroup>
            {group.map((messageData, i) => (
              <ChatMessage
                key={`group-${index}-message-${messageData.timestamp}-${i}`}
                bsStyle={loggedInUser === group[0].userID ? 'info' : ''}
                {...messageData}
              />
            ))}
          </ListGroup>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
