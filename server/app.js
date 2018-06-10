const mysql = require('mysql');
const express = require('express');
const app = express();

const db = mysql.createPool({
  host: 'db',
  user: 'root',
  password: 'testpass',
  database: 'challenge',
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.get('/test', function (req, res) {
  db.getConnection(function (err, connection) {
    if (err) {
      res.status(501).send(err.message);
      return;
    }

    connection.query('SELECT count(id) as count FROM Messages', (err, results, fields) => {
      if (err) {
        res.status(501).send(err.message);
        connection.release();
        return;
      }

      res.json({
        messageCount: results[0].count,
        backend: 'nodejs',
      });
      connection.release();
    });
  });
});

io.on('connection', (socket) => {
  socket.on('create message', (data) => {
    db.getConnection((err, connection) => {
      if (err) {
        res.status(501).send(err.message);
        return;
      }

      const messageData = { content: data.content, user_id: socket.userID };
      connection.query('INSERT INTO Messages ?', messageData, (err, res, fields) => {
        if (err) {
          res.status(501).send(err.message);
          connection.release();
          return;
        }

        socket.broadcast.emit('new message', {
          userID: socket.userID,
          username: socket.username,
          content: data.content,
          timestamp: res[0].created_date,
          type: 'user_input',
        });
      });
    });
  });

  socket.on('sign in or create user', (username) => {
    db.getConnection((err, connection) => {
      if (err) {
        res.status(501).send(err.message);
        return;
      }

      connection.query('SELECT id FROM Users', (err, res, fields) => {
        if (err) {
          res.status(501).send(err.message);
          connection.release();
          return;
        }

        let userID = res[0].id;
        if (!userID) {
          const userData = { username };
          connection.query('INSERT INTO Users SET ?', userData, (err, res, fields) => {
            if (err) {
              res.status(501).send(err.message);
              connection.release();
              return;
            }

            userID = res[0].id;
          });
        }

        socket.username = username;
        socket.userID = userID;
        socket.emit('login', { username: socket.username });
        socket.broadcast.emit('user joined', { username: socket.username });
      });
    });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user left', () => { username: socket.username });
  });
});

server.listen(process.env.PORT || 8000, function() {
    console.log('Listening on port 8000');
});
