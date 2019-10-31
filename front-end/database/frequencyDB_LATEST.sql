DROP DATABASE  IF EXISTS FrequencyCounter;
CREATE DATABASE FrequencyCounter;

CREATE TABLE Counter(
    counterID int NOT NULL AUTO_INCREMENT,
    `long` FLOAT(10,6),
    `lat` FLOAT(10,6),
	 `description` varchar(255) NOT NULL,
    PRIMARY KEY (counterID)
);

 CREATE TABLE Pedestrian(
    time TIMESTAMP NOT NULL,
    counterID int NOT NULL,
   `count_left` int(4),
	`count_right` int(4) ,
    PRIMARY KEY (time,counterID),
    FOREIGN KEY (counterID) REFERENCES Counter(counterID)
);

 CREATE TABLE Cyclist(
    time TIMESTAMP NOT NULL,
    counterID int NOT NULL,
   `count_left` int(4),
  `count_right` int(4),
    PRIMARY KEY (time,counterID),
    FOREIGN KEY (counterID) REFERENCES Counter(counterID)
);
