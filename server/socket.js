class ChatSocket {
  constructor(db, socket) {
    this.db = db;
    this.socket = socket;
    this.connection = null;
    this.inTransaction = false;
    this.userID = null;
    this.username = null;

    this.setUserData = this.setUserData.bind(this);
    this.getDBConnection = this.getDBConnection.bind(this);
    this.startDBTransaction = this.startDBTransaction.bind(this);
    this.createListener = this.createListener.bind(this);
    this.queryDB = this.queryDB.bind(this);
    this.emitError = this.emitError.bind(this);
    this.createListener = this.createListener.bind(this);
    this.emitEvent = this.emitEvent.bind(this);
    this.broadcastEvent = this.broadcastEvent.bind(this);
    this.releaseConnection = this.releaseConnection.bind(this);
    this.commitTransaction = this.commitTransaction.bind(this);
    this.getUserData = this.getUserData.bind(this);

    this.createListener('error', (error) => {
      console.error(error);
    });
  }

  emitError(error) {
    this.socket.emit('error', error);
  }

  createListener(eventText, callback) {
    this.socket.on(eventText, callback);
  }

  emitEvent(eventText, data) {
    this.socket.emit(eventText, data);
  }

  broadcastEvent(eventText, data) {
    this.socket.broadcast.emit(eventText, data);
  }

  setUserData({ userID, username }) {
    this.socket.userID = userID;
    this.socket.username = username;
    this.userID = userID;
    this.username = username;
  }

  getUserData() {
    return {
      userID: this.userID,
      username: this.username,
    };
  }

  releaseConnection(disconnect = false) {
    if (!this.connection) {
      return;
    }

    this.connection.release();

    this.connection = null;
    this.inTransaction = false;

    if (disconnect) {
      this.userID = null;
      this.username = null;
    }
  }

  getDBConnection(callback) {
    this.db.getConnection((err, connection) => {
      if (err) {
        this.emitError({ ...err, statusCode: 501 });
        return;
      }

      this.connection = connection;

      this.connection.on('error', (err) => {
        console.error(err);
        this.emitError({ ...err, statusCode: 501 });
        this.releaseConnection();
      });

      callback();
    });
  }

  startDBTransaction(callback) {
    if (!this.connection) {
      this.emitError({ message: 'No database connection found', statusCode: 501 });
      return;
    }

    this.connection.beginTransaction((err) => {
      if (err) {
        this.emitError({ ...err, statusCode: 501 });
        this.releaseConnection();
        return;
      }

      this.inTransaction = true;
      callback();
    });
  }

  queryDB({ query, queryData, rollback, callback }) {
    if (!this.connection) {
      this.emitError({ message: 'No database connection established', statusCode: 501 });
      return;
    }

    this.connection.query(query, queryData, (err, results) => {
      if (err) {
        if (rollback) {
          return this.connection.rollback(() => {
            this.emitError({ ...err, statusCode: 501 });
          });
        }

        this.emitError({ ...err, statusCode: 501 });
        this.releaseConnection();
        return;
      }

      callback(results);
    });
  }

  commitTransaction(callback) {
    if (!this.inTransaction) {
      return;
    } else if (!this.connection) {
      this.emitError({ message: 'No database connection established', statusCode: 501 });
    }

    this.connection.commit((err) => {
      if (err) {
        return this.connection.rollback(() => {
          this.emitError({ ...err, statusCode: 501 });
          this.releaseConnection();
        });
      }

      callback();
    });
  }
}

module.exports = ChatSocket;
