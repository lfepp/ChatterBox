import React, { Component } from 'react';
import { PageHeader, Grid, Row } from 'react-bootstrap';
import ChatContainer from './components/ChatContainer';

class App extends Component {
  render() {
    return (
      <Grid className="chat-app-container">
        <Row className="center">
          <PageHeader><h1>ChatASAPP</h1></PageHeader>
        </Row>
        <Row>
          <ChatContainer />
        </Row>
      </Grid>
    );
  }
}

export default App;
