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

    connection.on('error', (error) => {
      console.error(error);
      connection.release();
    });

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

const getDBConnection = (socket, callback) => {
  db.getConnection((err, connection) => {
    if (err) {
      socket.emit('error', { ...err, statusCode: 501 });
      return;
    }

    connection.on('error', (err) => {
      console.error(err);
      socket.emit('error', { ...err, statusCode: 501 });
      connection.release();
    });

    callback(connection);
  });
};

const startDBTransaction = (socket, connection, callback) => {
  connection.beginTransaction((err) => {
    if (err) {
      socket.emit('error', { ...err, statusCode: 501 });
      connection.release();
      return;
    }

    callback();
  });
};

const queryDB = (socket, connection, isTransaction, callback) => {};

io.set('transports', ['websocket', 'polling']);

io.on('connection', (socket) => {
  socket.on('error', (error) => {
    socket.emit('error', { ...error, statusCode: 500 });
  });

  socket.on('get logged in users request', ({ userID }) => {
    if (!userID) {
      socket.emit('error', { message: 'No user id in get user request', statusCode: 400 });
      return;
    }

    getDBConnection(socket, (connection) => {
      const userQueryData = [1];
      connection.query(
        ' \
          SELECT u.id, u.username, ur.is_active \
          FROM Users u \
            JOIN UserRooms ur ON (u.id = ur.user_id) \
          WHERE ur.room_id = ? \
        ',
        userQueryData,
        (error, results) => {
          if (error) {
            socket.emit('error', { ...error, statusCode: 501 });
            connection.release();
            return;
          }

          socket.emit('get logged in users response', { users: results });
          connection.release();
        },
      );
    });
  });

  socket.on('create message', (data) => {
    getDBConnection(socket, (connection) => {
      startDBTransaction(socket, connection, () => {
        const messageData = { content: data.content, user_id: socket.userID, room_id: 1 };
        connection.query('INSERT INTO Messages SET ?', messageData, (error, results) => {
          if (error) {
            return connection.rollback(() => {
              socket.emit('error', { ...error, statusCode: 501 });
              connection.release();
            });
          }

          connection.commit((commitErr) => {
            if (commitErr) {
              return connection.rollback(() => {
                socket.emit('error', { ...commitErr, statusCode: 501 });
              });
            }

            connection.query('SELECT room_id, created_date FROM Messages WHERE id = ?', [results.insertId], (e, result) => {
              if (e) {
                socket.emit('error', { ...e, statusCode: 501 });
                connection.release();
                return;
              }

              const emitMessageData = {
                userID: socket.userID,
                roomID: result[0].room_id,
                username: socket.username,
                content: data.content,
                timestamp: result[0].created_date,
                type: 'user_input',
              };
              io.emit('new message', emitMessageData);
              connection.release();
            });
          });
        });
      });
    });
  });

  socket.on('sign in or create user', (username) => {
    getDBConnection(socket, (connection) => {
      connection.query('SELECT id FROM Users WHERE username = ?', [username], (error, results) => {
        if (error) {
          socket.emit('error', { ...error, statusCode: 501 });
          connection.release();
          return;
        }

        if (results.length === 0) {
          startDBTransaction(socket, connection, () => {
            const userData = { username };
            connection.query('INSERT INTO Users SET ?', userData, (e, result) => {
              if (e) {
                return connection.rollback(() => {
                  socket.emit('error', { ...e, statusCode: 501 });
                  connection.release();
                });
              }

              const userID = result.insertId;
              const userRoomData = { user_id: userID, room_id: 1, is_active: true };
              connection.query('INSERT INTO UserRooms SET ?', userRoomData, (userRoomErr, userRoomRes) => {
                if (userRoomErr) {
                  return connection.rollback(() => {
                    socket.emit('error', { ...userRoomErr, statusCode: 501 });
                    connection.release();
                  });
                }

                connection.commit((commitErr) => {
                  if (commitErr) {
                    return connection.rollback(() => {
                      socket.emit('error', { ...commitErr, statusCode: 501 });
                    });
                  }

                  socket.username = username;
                  socket.userID = userID;
                  socket.emit('login', { username, userID });
                  socket.broadcast.emit('new message', {
                    type: 'automated',
                    content: `${username} has joined the chat`,
                    timestamp: new Date().getTime(),
                  });
                  connection.release();
                });
              });
            });
          });
        } else {
          socket.username = username;
          socket.userID = results[0].id;
          socket.emit('login', { username, userID: socket.userID });
          socket.broadcast.emit('new message', {
            type: 'automated',
            content: `${username} has joined the chat`,
            timestamp: new Date().getTime(),
          });

          const userRoomData = [socket.userID, 1];
          startDBTransaction(socket, connection, () => {
            connection.query('UPDATE UserRooms SET is_active = TRUE WHERE user_id = ? AND room_id = ?', userRoomData, (userRoomErr, userRoomRes) => {
              if (userRoomErr) {
                return connection.rollback(() => {
                  socket.emit('error', { ...userRoomErr, statusCode: 501 });
                  connection.release();
                });
              }

              connection.commit((commitErr) => {
                if (commitErr) {
                  return connection.rollback(() => {
                    socket.emit('error', { ...commitErr, statusCode: 501 });
                    connection.release();
                  });
                }

                socket.broadcast.emit('user joined', {
                  userID: socket.userID,
                  username: socket.username,
                  roomID: 1,
                });
                connection.release();
              });
            });
          });
        }
      });
    });
  });

  socket.on('get messages request', ({ before, getPrevious }) => {
    const timePeriod = {
      start: '2018-01-01',
      end: before ? new Date(before) : { toSqlString: () => ('NOW()') },
    };

    getDBConnection(socket, (connection) => {
      const selectValues = [socket.userID, 1];
      connection.query('SELECT last_online FROM UserRooms WHERE user_id = ? AND room_id = ?', selectValues, (error, results) => {
        if (error) {
          socket.emit('error', { ...error, statusCode: 501 });
          connection.release();
          return;
        }

        if (results.length > 0 && !getPrevious) {
          timePeriod.start = new Date(results[0].last_online);
        }

        const messageData = [
          1,
          timePeriod.start,
          timePeriod.end,
        ];

        connection.query(
          ' \
            SELECT u.username, m.* \
            FROM Messages m \
              JOIN Users u ON (u.id = m.user_id) \
            WHERE m.room_id = ? \
            AND m.created_date BETWEEN ? AND ? \
          ',
          messageData,
          (e, result) => {
            if (e) {
              console.error(e);
              socket.emit('error', { ...e, statusCode: 501 });
              connection.release();
              return;
            }

            const responseData = {
              messages: result.map(message => ({
                userID: message.user_id,
                roomID: message.room_id,
                username: message.username,
                content: message.content,
                timestamp: message.created_date,
                type: 'user_input',
              })),
            };
            socket.emit('get messages response', responseData);
            connection.release();
          },
        );
      });
    });
  });

  socket.on('disconnect', () => {
    getDBConnection(socket, (connection) => {
      startDBTransaction(socket, connection, () => {
        const username = socket.username;
        const userID = socket.userID;
        const updateValues = [userID, 1];
        connection.query('UPDATE UserRooms SET last_online = NOW(), is_active = FALSE WHERE user_id = ? AND room_id = ?', updateValues, (updateErr, updateRes) => {
          if (updateErr) {
            return connection.rollback(() => {
              socket.emit('error', { ...updateErr, statusCode: 501 });
              connection.release();
            });
          }

          connection.commit((commitErr) => {
            if (commitErr) {
              return connection.rollback(() => {
                socket.emit('error', { ...commitErr, statusCode: 501 });
                connection.release();
              });
            }

            if (username !== undefined) {
              socket.broadcast.emit('user left', { userID });
              socket.broadcast.emit('new message', {
                type: 'automated',
                content: `${username} has left the chat`,
                timestamp: new Date().getTime(),
              });
            }
            connection.release();
          });
        });
      });
    });
  });
});

server.listen(process.env.PORT || 8000, function() {
  console.log('Listening on port 8000');
});
