USE challenge;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

CREATE TABLE Users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  created_date DATETIME DEFAULT NOW()
);

CREATE TABLE Rooms (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE UserRooms (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  room_id INT NOT NULL,
  last_online DATETIME NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (room_id) REFERENCES Rooms(id)
);

CREATE TABLE Messages (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  content VARCHAR(500) NOT NULL,
  created_date DATETIME DEFAULT NOW(),
  user_id INT NOT NULL,
  room_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (room_id) REFERENCES Rooms(id)
);

INSERT INTO Rooms (name) values ("Main");
