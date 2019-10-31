// Global Variables
Chart.defaults.global.defaultFontFamily = `Lucida Sans Unicode, Lucida Grande, sans-serif`;
Chart.defaults.global.defaultFontSize = 12;
let today = new Date();
let todayDate =
  today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();
let graphTitle = "Left & Right Frequency "; //title of the graph displayed above the graph in the side panel
let date = todayDate; //date will change with datepicker
let pinId = -1; // id bound to a sensor
let myChart; // chartjs object

// // Create clickable markers on the map
createMarkers();

//Create map
const mymap = L.map("bendigoMap").setView([-36.7572, 144.2794], 17);
L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 17
  }
).addTo(mymap);

//Create sidebar
var sidebar = L.control.sidebar("sidebar", {
  closeButton: true,
  position: "right"
});
mymap.addControl(sidebar);

// Date selector.
// Added to side panel
const picker = new Pikaday({
  field: document.getElementById("datepicker"),
  format: "D-MM-YYYY",
  toString: function(date, format) {
    return dateFns.format(date, format);
  },
  onSelect: async function() {
    date = picker.toString();
    bothGraph(date, pinId);
    headerFrequency(date, pinId);
    tableData(date, pinId);
  }
});

// Button left-right onclick
async function bothGraph(dateChoice, sensorId) {
  const dataP = await getPedHourly(dateChoice, sensorId);
  const dataC = await getCycHourly(dateChoice, sensorId);
  graphTitle = "Left & Right Frequency ";
  formatHourly(dateChoice, dataP, dataC);
}

// Button left onclick
async function leftGraph(dateChoice, sensorId) {
  const dataP = await getPedLeft(dateChoice, sensorId);
  const dataC = await getCycLeft(dateChoice, sensorId);
  graphTitle = "Left Frequency ";
  formatHourly(dateChoice, dataP, dataC);
}

// Button right onclick
async function rightGraph(dateChoice, sensorId) {
  const dataP = await getPedRight(dateChoice, sensorId);
  const dataC = await getCycRight(dateChoice, sensorId);
  graphTitle = "Right Frequency ";
  formatHourly(dateChoice, dataP, dataC);
}

// Updates pedestrian total and cyclist total for the selected day in side panel header
async function headerFrequency(dateChoice, sensorId) {
  const pedTotal = await dailyPedCount(dateChoice, sensorId);
  const cycTotal = await dailyCycCount(dateChoice, sensorId);
  document.getElementById("pedestrian-count").innerHTML = pedTotal + "&nbsp;";
  document.getElementById("cyclist-count").innerHTML = "&nbsp;" + cycTotal;
}

// Sensor colour for current day
async function heatColour(date, sensorId) {
  const pedTotal = await dailyPedCount(date, sensorId);
  const cycTotal = await dailyCycCount(date, sensorId);
  const total = pedTotal + cycTotal;

  if (total >= 0 && total < 100) {
    return "#ff5959";
  } else if (total >= 100 && total < 200) {
    return "#df0054";
  } else if (total >= 200 && total < 300) {
    return "#8b104e";
  } else {
    return "#520556";
  }
}
var popup = L.popup().setContent('<p>Hello world!<br />This is a nice popup.</p>');

// Create markers on the map using longitude and latitude values from the database
// Create markers with an onclick which opens a side panel
// Side panel displays data on that given sensor

async function createMarkers() {
  const sensors = await getCounter();
  let sensorHoverData;

  for (let i = 0; i < sensors.length; ++i) {
    sensorHoverData = "Sensor " + sensors[i].counterID+ "<br>Desc: " + sensors[i].description + "<br>Long: " + sensors[i].long + "<br>Lat: "+ sensors[i].lat;
    let circleMarker = new L.circleMarker([sensors[i].long, sensors[i].lat], {
      radius: 10,
      color: await heatColour(todayDate, sensors[i].counterID),
      fillColor: await heatColour(todayDate, sensors[i].counterID),
      weight: 5,
      fillOpacity: 1,
      opacity: 0.5
    })
      .addTo(mymap)
      .on("click", function() {
        pinId = sensors[i].counterID;
        graphTitle = "Left & Right Frequency ";
        document.getElementById("title").innerHTML = sensors[i].description;
        bothGraph(todayDate, pinId);
        headerFrequency(todayDate, pinId);
        tableData(todayDate, pinId);
        sidebar.toggle();
      }).bindPopup(sensorHoverData)
      .on("mouseover",function(){
       
        circleMarker.openPopup();
      }).on("mouseout", function(){
        circleMarker.closePopup();
      });
  }
}

// Formats the data retreieved from the database to be displayed in an hourly graph
// Once formated method generateGraph is called
async function formatHourly(dateChoice, dataP, dataC) {
  const hourlyPedData = [];
  const hourlyCycData = [];

  for (let i = 0, j = 0; i <= 23, j < dataP.length; ++i) {
    if (i == dataP[j].hour) {
      hourlyPedData[i] = dataP[j].totalCount;
      j++;
    } else {
      hourlyPedData[i] = 0;
    }
  }

  for (let i = 0, j = 0; i <= 23, j < dataC.length; ++i) {
    if (i == dataC[j].hour) {
      hourlyCycData[i] = dataC[j].totalCount;
      j++;
    } else {
      hourlyCycData[i] = 0;
    }
  }
  return generateGraph(hourlyPedData, hourlyCycData, dateChoice);
}

// Display pedestrian and cyclist frequency for left and right or left or right direction in a table
async function tableData(dateChoice, sensorId) {
  const pedTotal = await dailyPedCount(dateChoice, sensorId);
  const cycTotal = await dailyCycCount(dateChoice, sensorId);
  const pedLR = await dailyPedLR(dateChoice, sensorId);
  const cycLR = await dailyCycLR(dateChoice, sensorId);
  document.getElementById("table").innerHTML =
    "<tr><td></td><th>Both</th><th>Left</th><th>Right</th></tr><tr><th>Pedestrian</th><td>" +
    pedTotal +
    "</td><td>" +
    pedLR[0].leftCount +
    "</td><td>" +
    pedLR[0].rightCount +
    "</td></tr><tr><th>Cyclist</th><td>" +
    cycTotal +
    "</td><td>" +
    cycLR[0].leftCount +
    "</td><td>" +
    cycLR[0].rightCount +
    "</td></tr>";
}

// Data passed through is the pedestrian and cyclist count for the given sensor
// Data is displayed on a line graph
function generateGraph(pedData, cycData, dateChoice) {
  if (myChart != null) {
    myChart.destroy();
  }
  const date = dateChoice.replace(/-/g, "/");
  var canvas = document.getElementById("myChart");
  var ctx = canvas.getContext("2d");
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23
      ],
      datasets: [
        {
          label: "Pedestrian",
          fill: false,
          data: pedData,
          backgroundColor: "rgba(114, 147, 203, 1)",
          borderColor: "rgba(114, 147, 203, 1)",
          borderWidth: 2,
          pointRadius: 0
        },
        {
          label: "Cyclist",
          fill: false,
          data: cycData,
          backgroundColor: "rgba(225, 151, 76, 1)",
          borderColor: "rgba(225, 151, 76, 1)",
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: graphTitle + date,
        fontSize: 15
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          boxWidth: 20
        }
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false
            },
            scaleLabel: {
              display: true,
              labelString: "Hour",
              fontSize: 13,
              fontStyle: "bold"
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            },
            gridLines: {
              display: false
            },
            scaleLabel: {
              display: true,
              labelString: "Count",
              fontSize: 13,
              fontStyle: "bold"
            }
          }
        ]
      }
    }
  });

  return (document.getElementById("myChart").innerHTML = canvas);
}
const legendData = [
  {
    name: "Daily Total Frequency",
    elements: [
      {
        imageData:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAAIUlEQVR42mP8Hxn5n4HKgHHU0FFDRw0dNXTU0FFDB6mhAPOnOIaROBhwAAAAAElFTkSuQmCC",
        label: "0 - 99"
      },
      {
        imageData:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAAIUlEQVR42mO8zxDyn4HKgHHU0FFDRw0dNXTU0FFDB6mhAEPXLjCe90tdAAAAAElFTkSuQmCC",
        label: "100 - 199"
      },
      {
        imageData:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAAIUlEQVR42mPsFvD7z0BlwDhq6Kiho4aOGjpq6Kihg9RQAByNKB69gEkNAAAAAElFTkSuQmCC",
        label: "200 - 299"
      },
      {
        imageData:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAAIUlEQVR42mMMYg37z0BlwDhq6Kiho4aOGjpq6Kihg9RQACYOIzI5iLSfAAAAAElFTkSuQmCC",
        label: "300+"
      }
    ]
  }
];
//Add legend to the map
//Data present in the legend is from variable legendData
var legend = L.control.base64legend({
  position: "bottomleft",
  legends: legendData,
  collapseSimple: true
});
mymap.addControl(legend);


//  mymap.on('click', function(e) {
//      alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
//  });

function openNav() {
  
  if(document.getElementById("mySidebar2").style.width == "0px" ){
    document.getElementById("mySidebar2").style.width = "250px";
	document.getElementById("bendigoMap").style.marginLeft = "250px";
  }
  else if(document.getElementById("mySidebar2").style.width == ""){
    document.getElementById("mySidebar2").style.width = "250px";
	document.getElementById("bendigoMap").style.marginLeft = "250px";
  }
  else{
    document.getElementById("mySidebar2").style.width = "0px";
	document.getElementById("bendigoMap").style.marginLeft = "0";
  }
 }
//Close the sidebar
 function closeNav() {
  document.getElementById("mySidebar2").style.width = "0";
  document.getElementById("bendigoMap").style.marginLeft = "0";
 }
 
//Display 'getting started...' modal
 // $(function(){
	 
  // var overlay = $('<div id="overlay"><\/div>');
  // overlay.show();
  // overlay.appendTo(document.body);
  // $('.popup').show();
  // $('.close').click(function(){
  // $('.popup').hide();
  // overlay.appendTo(document.body).remove();
  // return false;
  // });
    
  // $(".popup").click(function(ev){
    // if(ev.target != this) return;
    // $('.popup').hide();
	// overlay.appendTo(document.body).remove();
  // });
  
  var overlay = $('<div id="overlay"><\/div>');
if (localStorage.getItem('popState', 'value') != 'shown') {
  $(".popup").delay(1000).fadeIn();
   overlay.delay(1000).fadeIn();
   overlay.appendTo(document.body);
  localStorage.setItem('popState', 'shown');
  console.log('localstorage item set.');
} else {
    console.log('No modal for you.');
}

$('.close').on('click', function(e) {
  $('.popup').fadeOut(); // Now the pop up is hiden.
  overlay.appendTo(document.body).fadeOut();
  return false;
});

$('.popup').on('click', function(e) {
  $('.popup').fadeOut();
  overlay.appendTo(document.body).fadeOut();
  return false;
});

// //Sticky sensor popup
// window.onscroll = function() {stickyPopup()};

// var popupsensor = document.getElementById("title-header");
// var sticky = title-header.offsetTop;

// function stickyPopup() {
//   if (window.pageYOffset >= sticky) {
//     title-header.classList.add("sticky")
//   } else {
//     title-header.classList.remove("sticky");
//   }
// }