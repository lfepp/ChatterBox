import React from 'react';
import ChatMessage from '../ChatMessage';

const MessageList = ({ messages }) => {
  const groupedMessages = [];
  let currentGroup = null;
  messages.forEach((messageData, index) => {
    if (!currentGroup) {
      currentGroup = [messageData];
    } else {
      if (currentGroup[0].userID === messageData.userID) {
        currentGroup.push(messageData);
      } else {
        groupedMessages.push(currentGroup);
        currentGroup = null;
      }
    }
  });

  return groupedMessages.map(group => (
    <div>
      <h3>{group.username}</h3>
      <div>
        {group.map(messageData => (
          <ChatMessage
            {...messageData}
          />
        ))}
      </div>
    </div>
  ));
};

export default MessageList;
