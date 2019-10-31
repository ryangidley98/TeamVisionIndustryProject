const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const app = express();
app.use(cors());

//  Create connection to mysql server
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  db: "FrequencyCounter"
});

// Connect to database
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

// Swap to database
connection.changeUser(
  {
    database: "FrequencyCounter"
  },
  function(err) {
    if (err) {
      console.log("error in changing database", err);
      return;
    }
  }
);

// ++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++ COUNTER DATA+++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++
app.get("/getCounter", (req, res) => {
  let sql = "SELECT * FROM Counter";
  let query = connection.query(sql, (error, result) => {
    if (error) throw error;
    res.json(result);
  });
});

// ++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++ TOTAL DAILY COUNT++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++

// PEDESTRIAN
app.get("/getPedDaily/:date/:id", (req, res) => {
  const date = `${req.params.date}`;
  const dateSplit = date.split("-");
  const day = dateSplit[0];
  const month = dateSplit[1];
  const year = dateSplit[2];
  const sensId = `${req.params.id}`;
  let sql =
    `SELECT SUM(count_left+count_right) AS 'dailyCount' FROM Pedestrian WHERE EXTRACT(DAY FROM time) = ` +
    day +
    ` AND EXTRACT(MONTH FROM time)=` +
    month +
    ` AND EXTRACT(YEAR FROM time)=` +
    year +
    ` AND counterID=` +
    sensId;
  let query = connection.query(sql, (error, result) => {
    if (error) throw error;
    res.json(result);
  });
});

// CYCLIST
app.get("/getCycDaily/:date/:id", (req, res) => {
  const date = `${req.params.date}`;
  const dateSplit = date.split("-");
  const day = dateSplit[0];
  const month = dateSplit[1];
  const year = dateSplit[2];
  const sensId = `${req.params.id}`;
  let sql =
    `SELECT SUM(count_left+count_right) AS 'dailyCount' FROM Cyclist WHERE EXTRACT(DAY FROM time) = ` +
    day +
    ` AND EXTRACT(MONTH FROM time)=` +
    month +
    ` AND EXTRACT(YEAR FROM time)=` +
    year +
    ` AND counterID=` +
    sensId;
  let query = connection.query(sql, (error, result) => {
    if (error) throw error;
    res.json(result);
  });
});

// ++++++++++++++++++++++++++++++++++++++++++++
// +++++ TOTAL DAILY COUNT LEF & RIGHT+++++++++
// ++++++++++++++++++++++++++++++++++++++++++++

// PEDESTRIAN
app.get("/getPedLR/:date/:id", (req, res) => {
  const date = `${req.params.date}`;
  const dateSplit = date.split("-");
  const day = dateSplit[0];
  const month = dateSplit[1];
  const year = dateSplit[2];
  const sensId = `${req.params.id}`;
  let sql =
    `SELECT SUM(count_left) AS 'leftCount',SUM(count_right) AS 'rightCount' FROM Pedestrian WHERE EXTRACT(DAY FROM time) = ` +
    day +
    ` AND EXTRACT(MONTH FROM time)=` +
    month +
    ` AND EXTRACT(YEAR FROM time)=` +
    year +
    ` AND counterID=` +
    sensId;
  let query = connection.query(sql, (error, result) => {
    if (error) throw error;
    res.json(result);
  });
});

// Cyclist
app.get("/getCycLR/:date/:id", (req, res) => {
  const date = `${req.params.date}`;
  const dateSplit = date.split("-");
  const day = dateSplit[0];
  const month = dateSplit[1];
  const year = dateSplit[2];
  const sensId = `${req.params.id}`;
  let sql =
    `SELECT SUM(count_left) AS 'leftCount',SUM(count_right) AS 'rightCount' FROM Cyclist WHERE EXTRACT(DAY FROM time) = ` +
    day +
    ` AND EXTRACT(MONTH FROM time)=` +
    month +
    ` AND EXTRACT(YEAR FROM time)=` +
    year +
    ` AND counterID=` +
    sensId;
  let query = connection.query(sql, (error, result) => {
    if (error) throw error;
    res.json(result);
  });
});

// +++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++ DAILY COUNT FOR SPECIFIED DAY +++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++

// HOURLY PED COUNT
app.get("/hourlyPedCount/:date/:id", (req, res) => {
  const date = `${req.params.date}`;
  const dateSplit = date.split("-");
  const day = dateSplit[0];
  const month = dateSplit[1];
  const year = dateSplit[2];
  const sensId = `${req.params.id}`;

  let sql =
    `SELECT EXTRACT(HOUR FROM time) as 'hour', 
  SUM(count_left+count_right) as 'totalCount' 
  FROM pedestrian 
  WHERE EXTRACT(DAY FROM time) = ` +
    day +
    ` AND EXTRACT(MONTH FROM time)=` +
    month +
    ` AND EXTRACT(YEAR FROM time)=` +
    year +
    ` AND counterID=` +
    sensId +
    `
  GROUP BY EXTRACT(HOUR FROM time) 
  ORDER BY EXTRACT(HOUR FROM time)`;
  let query = connection.query(sql, (error, result) => {
    if (error) throw error;
    console.log(result);
    res.json(result);
  });
});

// HOURLY CYC COUNT
app.get("/hourlyCycCount/:date/:id", (req, res) => {
  const date = `${req.params.date}`;
  const dateSplit = date.split("-");
  const day = dateSplit[0];
  const month = dateSplit[1];
  const year = dateSplit[2];
  const sensId = `${req.params.id}`;

  let sql =
    `SELECT EXTRACT(HOUR FROM time) as 'hour', 
  SUM(count_left+count_right) as 'totalCount' 
  FROM cyclist
  WHERE EXTRACT(DAY FROM time) = ` +
    day +
    ` AND EXTRACT(MONTH FROM time)=` +
    month +
    ` AND EXTRACT(YEAR FROM time)=` +
    year +
    ` AND counterID=` +
    sensId +
    `
  GROUP BY EXTRACT(HOUR FROM time) 
  ORDER BY EXTRACT(HOUR FROM time)`;
  let query = connection.query(sql, (error, result) => {
    if (error) throw error;
    console.log(result);
    res.json(result);
  });
});

// +++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++ PED & CYC LEFT COUNT +++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++

// PED
app.get("/hourlyPedLeft/:date/:id", (req, res) => {
  const date = `${req.params.date}`;
  const dateSplit = date.split("-");
  const day = dateSplit[0];
  const month = dateSplit[1];
  const year = dateSplit[2];
  const sensId = `${req.params.id}`;

  let sql =
    `SELECT EXTRACT(HOUR FROM time) as 'hour', 
  SUM(count_left) as 'totalCount' 
  FROM pedestrian 
  WHERE EXTRACT(DAY FROM time) = ` +
    day +
    ` AND EXTRACT(MONTH FROM time)=` +
    month +
    ` AND EXTRACT(YEAR FROM time)=` +
    year +
    ` AND counterID=` +
    sensId +
    `
  GROUP BY EXTRACT(HOUR FROM time) 
  ORDER BY EXTRACT(HOUR FROM time)`;
  let query = connection.query(sql, (error, result) => {
    if (error) throw error;
    console.log(result);
    res.json(result);
  });
});

// CYC
app.get("/hourlyCycLeft/:date/:id", (req, res) => {
  const date = `${req.params.date}`;
  const dateSplit = date.split("-");
  const day = dateSplit[0];
  const month = dateSplit[1];
  const year = dateSplit[2];
  const sensId = `${req.params.id}`;

  let sql =
    `SELECT EXTRACT(HOUR FROM time) as 'hour', 
  SUM(count_left) as 'totalCount' 
  FROM cyclist 
  WHERE EXTRACT(DAY FROM time) = ` +
    day +
    ` AND EXTRACT(MONTH FROM time)=` +
    month +
    ` AND EXTRACT(YEAR FROM time)=` +
    year +
    ` AND counterID=` +
    sensId +
    `
  GROUP BY EXTRACT(HOUR FROM time) 
  ORDER BY EXTRACT(HOUR FROM time)`;
  let query = connection.query(sql, (error, result) => {
    if (error) throw error;
    console.log(result);
    res.json(result);
  });
});

// +++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++ PED & CYC RIGHT COUNT +++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++

// PED
app.get("/hourlyPedRight/:date/:id", (req, res) => {
  const date = `${req.params.date}`;
  const dateSplit = date.split("-");
  const day = dateSplit[0];
  const month = dateSplit[1];
  const year = dateSplit[2];
  const sensId = `${req.params.id}`;

  let sql =
    `SELECT EXTRACT(HOUR FROM time) as 'hour', 
  SUM(count_right) as 'totalCount' 
  FROM pedestrian 
  WHERE EXTRACT(DAY FROM time) = ` +
    day +
    ` AND EXTRACT(MONTH FROM time)=` +
    month +
    ` AND EXTRACT(YEAR FROM time)=` +
    year +
    ` AND counterID=` +
    sensId +
    `
  GROUP BY EXTRACT(HOUR FROM time) 
  ORDER BY EXTRACT(HOUR FROM time)`;
  let query = connection.query(sql, (error, result) => {
    if (error) throw error;
    console.log(result);
    res.json(result);
  });
});

// CYC
app.get("/hourlyCycRight/:date/:id", (req, res) => {
  const date = `${req.params.date}`;
  const dateSplit = date.split("-");
  const day = dateSplit[0];
  const month = dateSplit[1];
  const year = dateSplit[2];
  const sensId = `${req.params.id}`;

  let sql =
    `SELECT EXTRACT(HOUR FROM time) as 'hour', 
  SUM(count_right) as 'totalCount' 
  FROM cyclist 
  WHERE EXTRACT(DAY FROM time) = ` +
    day +
    ` AND EXTRACT(MONTH FROM time)=` +
    month +
    ` AND EXTRACT(YEAR FROM time)=` +
    year +
    ` AND counterID=` +
    sensId +
    `
  GROUP BY EXTRACT(HOUR FROM time) 
  ORDER BY EXTRACT(HOUR FROM time)`;
  let query = connection.query(sql, (error, result) => {
    if (error) throw error;
    console.log(result);
    res.json(result);
  });
});

// +++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++ SENSOR DEESCRIPTION +++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++

app.get("/sensDesc/:id", (req, res) => {
  let sql =
    "SELECT description FROM COUNTER WHERE counterID =" + `${req.params.id}`;

  let query = connection.query(sql, (error, result) => {
    if (error) throw error;
    res.json(result);
  });
});

app.listen("3000", () => {
  console.log("Server started on port 3000");
});
