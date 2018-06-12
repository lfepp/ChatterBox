import React, { Component } from 'react';
import { PageHeader, Grid, Row } from 'react-bootstrap';
import ChatRoomContainer from './components/ChatContainer';

class App extends Component {
  render() {
    return (
      <Grid className="chat-app-container">
        <Row className="center">
          <PageHeader>ChatASAPP</PageHeader>
        </Row>
        <Row>
          <ChatRoomContainer />
        </Row>
      </Grid>
    );
  }
}

export default App;
