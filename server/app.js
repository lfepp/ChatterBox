const mysql = require('mysql');
const express = require('express');
const ChatSocket = require('./socket.js');

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

io.set('transports', ['websocket', 'polling']);

io.on('connection', (socket) => {
  let chatSocket = new ChatSocket(db, socket);

  chatSocket.createListener('get logged in users request', ({ userID }) => {
    if (!userID) {
      chatSocket.emitError({ message: 'No user id in get user request', statusCode: 400 });
      return;
    }

    chatSocket.getDBConnection(() => {
      chatSocket.queryDB({
        query: ' \
          SELECT u.id, u.username, ur.is_active \
          FROM Users u \
            JOIN UserRooms ur ON (u.id = ur.user_id) \
          WHERE ur.room_id = ? \
        ',
        queryData: [1],
        rollback: false,
        callback: (results) => {
          chatSocket.emitEvent('get logged in users response', { users: results });
          chatSocket.releaseConnection();
        },
      });
    });
  });

  chatSocket.createListener('create message', (data) => {
    chatSocket.getDBConnection(() => {
      chatSocket.startDBTransaction(() => {
        const messageData = { content: data.content, user_id: chatSocket.getUserData().userID, room_id: 1 };

        chatSocket.queryDB({
          query: 'INSERT INTO Messages SET ?',
          queryData: messageData,
          rollback: true,
          callback: (insertResults) => {
            chatSocket.commitTransaction(() => {
              chatSocket.queryDB({
                query: 'SELECT room_id, created_date FROM Messages WHERE id = ?',
                queryData: [insertResults.insertId],
                rollback: false,
                callback: (selectResults) => {
                  const emitMessageData = {
                    ...chatSocket.getUserData(),
                    roomID: selectResults[0].room_id,
                    content: data.content,
                    timestamp: selectResults[0].created_date,
                    type: 'user_input',
                  };

                  io.emit('new message', emitMessageData);
                  chatSocket.releaseConnection();
                },
              });
            });
          },
        });
      });
    });
  });

  socket.on('sign in or create user', (username) => {
    chatSocket.getDBConnection(() => {
      chatSocket.queryDB({
        query: 'SELECT id FROM Users WHERE username = ?',
        queryData: [username],
        rollback: false,
        callback: (selectUserResults) => {
          if (selectUserResults.length === 0) {
            chatSocket.startDBTransaction(() => {
              chatSocket.queryDB({
                query: 'INSERT INTO Users SET ?',
                queryData: { username },
                rollback: true,
                callback: (insertUserResults) => {
                  const userID = insertUserResults.insertId;
                  const userRoomData = { user_id: userID, room_id: 1, is_active: true };

                  chatSocket.queryDB({
                    query: 'INSERT INTO UserRooms SET ?',
                    queryData: userRoomData,
                    rollback: true,
                    callback: () => {
                      chatSocket.commitTransaction(() => {
                        chatSocket.setUserData({ userID, username });
                        chatSocket.emitEvent('login', { userID, username });
                        chatSocket.broadcastEvent('new message', {
                          type: 'automated',
                          content: `${username} has joined the chat`,
                          timestamp: new Date().getTime(),
                        });
                        chatSocket.releaseConnection();
                      });
                    }
                  });
                },
              });
            });
          } else {
            const loginUserData = {
              userID: selectUserResults[0].id,
              username,
            };

            chatSocket.setUserData(loginUserData);
            chatSocket.emitEvent('login', loginUserData);
            chatSocket.broadcastEvent('new message', {
              type: 'automated',
              content: `${loginUserData.username} has joined the chat`,
              timestamp: new Date().getTime(),
            });

            chatSocket.startDBTransaction(() => {
              chatSocket.queryDB({
                query: 'UPDATE UserRooms SET is_active = TRUE WHERE user_id = ? AND room_id = ?',
                queryData: [loginUserData.userID, 1],
                rollback: true,
                callback: () => {
                  chatSocket.commitTransaction(() => {
                    chatSocket.broadcastEvent('user joined', {
                      ...chatSocket.getUserData(),
                      roomID: 1,
                    });
                    chatSocket.releaseConnection();
                  });
                },
              });
            });
          }
        },
      });
    });
  });

  chatSocket.createListener('get messages request', ({ before, getPrevious }) => {
    const timePeriod = {
      start: '2018-01-01',
      end: before ? new Date(before) : { toSqlString: () => ('NOW()') },
    };

    chatSocket.getDBConnection(() => {
      chatSocket.queryDB({
        query: 'SELECT last_online FROM UserRooms WHERE user_id = ? AND room_id = ?',
        queryData: [chatSocket.getUserData().userID, 1],
        rollback: false,
        callback: (selectResults) => {
          if (selectResults.length > 0 && !getPrevious) {
            timePeriod.start = new Date(selectResults[0].last_online);
          }

          const messageData = [
            1,
            timePeriod.start,
            timePeriod.end,
          ];

          chatSocket.queryDB({
            query: ' \
              SELECT u.username, m.* \
              FROM Messages m \
                JOIN Users u ON (u.id = m.user_id) \
              WHERE m.room_id = ? \
              AND m.created_date BETWEEN ? AND ? \
            ',
            queryData: messageData,
            rollback: false,
            callback: (selectMessageResults) => {
              const responseData = {
                messages: selectMessageResults.map(message => ({
                  userID: message.user_id,
                  roomID: message.room_id,
                  username: message.username,
                  content: message.content,
                  timestamp: message.created_date,
                  type: 'user_input',
                })),
              };

              chatSocket.emitEvent('get messages response', responseData);
              chatSocket.releaseConnection();
            },
          });
        },
      });
    });
  });

  socket.on('disconnect', () => {
    chatSocket.getDBConnection(() => {
      chatSocket.startDBTransaction(() => {
        const { userID, username } = chatSocket.getUserData();

        chatSocket.queryDB({
          query: 'UPDATE UserRooms SET last_online = NOW(), is_active = FALSE WHERE user_id = ? AND room_id = ?',
          queryData: [userID, 1],
          rollback: true,
          callback: () => {
            chatSocket.commitTransaction(() => {
              if (username !== null) {
                chatSocket.broadcastEvent('user left', { userID });
                chatSocket.broadcastEvent('new message', {
                  type: 'automated',
                  content: `${username} has left the chat`,
                  timestamp: new Date().getTime(),
                });
              }
              chatSocket.releaseConnection(true);
            });
          },
        });
      });
    });
  });
});

server.listen(process.env.PORT || 8000, function() {
  console.log('Listening on port 8000');
});
