// RETURNS COUNTERID,LONG,LAT AND DESCRIPTION
async function getCounter() {
  const response = await fetch("http://localhost:3000/getCounter");
  const data = await response.json();
  return data;
}

// DAILY COUNT FOR PEDESTRIANS
async function dailyPedCount(dateChoice, sensorId) {
  const response = await fetch(
    "http://localhost:3000/getPedDaily/" + dateChoice + "/" + sensorId
  );
  const data = await response.json();
  if (data[0].dailyCount != null) {
    return data[0].dailyCount;
  } else {
    return 0;
  }
}

// DAILY COUNT FOR CYCLIST
async function dailyCycCount(dateChoice, sensorId) {
  const response = await fetch(
    "http://localhost:3000/getCycDaily/" + dateChoice + "/" + sensorId
  );
  const data = await response.json();
  if (data[0].dailyCount != null) {
    return data[0].dailyCount;
  } else {
    return 0;
  }
}
// LEFT & RIGHT COUNT FOR PED
async function dailyPedLR(dateChoice, sensorId) {
  const response = await fetch(
    "http://localhost:3000/getPedLR/" + dateChoice + "/" + sensorId
  );
  const data = await response.json();
  if (data[0].leftCount == null) {
    data[0].leftCount = 0;
  }
  if (data[0].rightCount == null) {
    data[0].rightCount = 0;
  }
  return data;
}

// LEFT & RIGHT COUNT FOR CYC
async function dailyCycLR(dateChoice, sensorId) {
  const response = await fetch(
    "http://localhost:3000/getCycLR/" + dateChoice + "/" + sensorId
  );
  const data = await response.json();
  if (data[0].leftCount == null) {
    data[0].leftCount = 0;
  }
  if (data[0].rightCount == null) {
    data[0].rightCount = 0;
  }
  return data;
}
// HOURLY COUNT FOR PEDESTRIAN FOR BOTH DIRECTIONS
async function getPedHourly(dateChoice, sensorId) {
  const response = await fetch(
    "http://localhost:3000/hourlyPedCount/" + dateChoice + "/" + sensorId
  );
  const data = await response.json();
  return data;
}

// HOURLY COUNT FOR CYCLIST FOR BOTH DIRECTIONS
async function getCycHourly(dateChoice, sensorId) {
  const response = await fetch(
    "http://localhost:3000/hourlyCycCount/" + dateChoice + "/" + sensorId
  );
  const data = await response.json();
  return data;
}
//HOURLY COUNT FOR PEDESTRIAN LEFT DIRECTION
async function getPedLeft(dateChoice, sensorId) {
  const response = await fetch(
    "http://localhost:3000/hourlyPedLeft/" + dateChoice + "/" + sensorId
  );
  const data = await response.json();
  return data;
}

// HOURLY COUNT FOR CYCLIST LEFT DIRECTION
async function getCycLeft(dateChoice, sensorId) {
  const response = await fetch(
    "http://localhost:3000/hourlyCycLeft/" + dateChoice + "/" + sensorId
  );
  const data = await response.json();
  return data;
}

//HOURLY COUNT FOR PEDESTRIAN RIGHT DIRECTION
async function getPedRight(dateChoice, sensorId) {
  const response = await fetch(
    "http://localhost:3000/hourlyPedRight/" + dateChoice + "/" + sensorId
  );
  const data = await response.json();
  return data;
}

// HOURLY COUNT FOR CYCLIST RIGHT DIRECTION
async function getCycRight(dateChoice, sensorId) {
  const response = await fetch(
    "http://localhost:3000/hourlyCycRight/" + dateChoice + "/" + sensorId
  );
  const data = await response.json();
  return data;
}
