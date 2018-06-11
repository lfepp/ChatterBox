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
const io = require('socket.io')(server, {
  pingInterval: 10 * 1000,
  pingTimeout: 30 * 1000,
});

app.get('/test', function (req, res) {
  db.getConnection(function (err, connection) {
    if (err) {
      res.status(501).send(err.message);
      return;
    }

    connection.on('error', (error) => { console.error(error); });

    connection.query('SELECT count(id) as count FROM Messages', (error, results) => {
      if (error) {
        res.status(501).send(error.message);
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

io.set('transports', ['websocket', 'polling']);

io.on('connection', (socket) => {
  socket.on('error', (error) => {
    socket.emit('error', { message: error.message, statusCode: 500 });
  });

  socket.on('create message', (data) => {
    db.getConnection((err, connection) => {
      if (err) {
        socket.emit('error', { message: err.message, statusCode: 501 });
        return;
      }

      connection.on('error', (error) => { console.error(error); });

      const messageData = { content: data.content, user_id: socket.userID, room_id: 1 };
      connection.query('INSERT INTO Messages SET ?', messageData, (error, results) => {
        if (error) {
          socket.emit('error', { message: error.message, statusCode: 501 });
          connection.release();
          return;
        }

        connection.query('SELECT created_date FROM Messages WHERE id = ?', [results.insertId], (e, result) => {
          if (e) {
            socket.emit('error', { message: e.message, statusCode: 501 });
            connection.release();
            return;
          }

          io.emit('new message', {
            userID: socket.userID,
            roomID: result[0].room_id,
            username: socket.username,
            content: data.content,
            timestamp: result[0].created_date,
            type: 'user_input',
          });
        });
      });
    });
  });

  socket.on('sign in or create user', (username) => {
    db.getConnection((err, connection) => {
      if (err) {
        socket.emit('error', { message: err.message, statusCode: 501 });
        return;
      }

      connection.on('error', (error) => { console.error(error); });

      connection.query('SELECT id FROM Users WHERE username = ?', [username], (error, results) => {
        if (error) {
          socket.emit('error', { message: error.message, statusCode: 501 });
          connection.release();
          return;
        }

        let userID;
        if (results.length === 0) {
          const userData = { username };
          connection.query('INSERT INTO Users SET ?', userData, (e, result) => {
            if (e) {
              socket.emit('error', { message: e.message, statusCode: 501 });
              connection.release();
              return;
            }

            userID = result.insertId;
            const userRoomData = { user_id: userID, room_id: 1 };
            connection.query('INSERT INTO UserRooms SET ?', userRoomData, (userRoomErr, userRoomRes) => {
              if (userRoomErr) {
                socket.emit('error', { message: userRoomErr.message, statusCode: 501 });
                connection.release();
                return;
              }
            });
          });
        } else {
          userID = results[0].id;
        }

        socket.username = username;
        socket.userID = userID;
        socket.emit('login', { username: socket.username });
        socket.broadcast.emit('new message', {
          type: 'automated',
          content: `${socket.username} has joined the chat`,
          timestamp: new Date().getTime(),
        });
      });
    });
  });

  socket.on('get messages request', ({ before }) => {
    const timePeriod = {
      start: null,
      end: before,
    };

    db.getConnection((err, connection) => {
      if (err) {
        socket.emit('error', { message: err.message, statusCode: 501 });
        return;
      }

      connection.on('error', (error) => { console.error(error); });

      const selectValues = [socket.userID, 1];
      connection.query('SELECT last_online FROM UserRooms WHERE user_id = ? AND room_id = ?', selectValues, (error, results) => {
        if (error) {
          socket.emit('error', { message: error.message, statusCode: 501 });
          connection.release();
          return;
        }

        if (results.length > 0) {
          timePeriod.start = results[0].last_online;
        }

        const messageData = [
          socket.userID,
          1,
          timePeriod.start ? timePeriod.start : '2018-01-01',
          timePeriod.end ? timePeriod.end : 'NOW()',
        ];
        connection.query('SELECT * FROM Messages WHERE user_id = ? AND room_id = ? AND created_date BETWEEN ? AND ?', messageData, (e, result) => {
          if (e) {
            socket.emit('error', { message: e.message, statusCode: 501 });
            connection.release();
            return;
          }

          socket.emit('get messages response', { messages: result });
        });
      });
    });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('new message', {
      type: 'automated',
      content: `${socket.username} has left the chat`,
      timestamp: new Date().getTime(),
    });
    db.getConnection((err, connection) => {
      if (err) {
        socket.emit('error', { message: err.message, statusCode: 501 });
        return;
      }

      connection.on('error', (error) => { console.error(error); });

      const updateValues = [socket.userID, 1];
      connection.query('UPDATE UserRooms SET last_online = NOW() WHERE user_id = ? AND room_id = ?', updateValues, (updateErr, updateRes) => {
        if (updateErr) {
          socket.emit('error', { message: updateErr.message, statusCode: 501 });
          connection.release();
          return;
        }
      });
    });
  });
});

server.listen(process.env.PORT || 8000, function() {
    console.log('Listening on port 8000');
});
