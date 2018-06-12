import React, { Component } from 'react';
import ChatContainer from './components/ChatContainer';

class App extends Component {
  render() {
    return (
      <div className="chat-app-container">
        <h1>ChatASAPP</h1>
        <ChatContainer />
      </div>
    );
  }
}

export default App;
