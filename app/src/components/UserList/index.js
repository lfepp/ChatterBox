import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

const UserList = ({ users, isLoggedIn, loggedInUser }) => {
  if (users.length === 0 || !isLoggedIn) {
    return (
      <div>
        <h2>Users</h2>
        {!isLoggedIn ? <p>Please sign in to see the users in this room</p> : <p>It looks like you're the only one here</p>}
      </div>
    );
  }

  return (
    <div>
      <h2>Users</h2>
      <ListGroup>
        {
          users.filter(
            user => user.id !== loggedInUser
          ).map(user => (
            <ListGroupItem
              key={`user-list-group-item-${user.username}`}
              header={user.username}
              bsStyle={user.is_active ? 'success' : 'danger'}
            >
              {user.is_active ? 'Online' : 'Offline'}
            </ListGroupItem>
          ))
        }
      </ListGroup>
    </div>
  );
};


export default UserList;
