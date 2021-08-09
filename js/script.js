// Draw game on window load
window.onload = function() {drawGame()};

// Variables
var firstClick = true;
// For switching colors
var color1 = 0;
var column1 = 0;
var row1 = 0;
var color2 = 0;
var column2 = 0;
var row2 = 0;
// Arrays for storing colors in order and shuffeled
var order = [];
var shuffled = [];
// Keeping track of moves made
var moves = 0;
// Change the size of the play field
var size = 5;
// Sound effects
var soundCorrect;
var soundClick;

// Generates a random color in hex
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Converts rgb color to hex
function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255)
    throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
}

// Shuffels an array
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

// Preloads and plays sound effects
function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}

// Main function
function drawGame() {
  var c = document.getElementById("myCanvas");
  // Sets the canvas to the size of the browser window. Height - 100 because of the menu bar on top.
  c.width = window.innerWidth;
  c.height = window.innerHeight - 100;
  var ctx = c.getContext("2d");

  // Load sound files
  soundCorrect = new sound("./music/correct.mp3");
  soundClick = new sound("./music/click.wav");

  // Resests arrays on load
  shuffled.splice(0,shuffled.length);
  order.splice(0,order.length);

  // Adding event listener for mouse click and/or touch input
  c.addEventListener("mousedown", function(e) {getMousePosition(c, e);});

  // Variables
  var i;
  var x = 0;
  var y = 0;
  var width = c.width / size;
  var height = c.height / size;
  var color1 = getRandomColor();
  var color2 = getRandomColor();
  // Size * size + 1 because the last color that gets generatet is not correct. So the generate one more.
  var gradient = jsgradient.generateGradient(color1, color2, size * size + 1);

  // Draw the color boxes
  for (i = 0; i < size * size; i++) {
    ctx.fillStyle = gradient[i];
    ctx.fillRect(x, y, width, height);
    // Add information about the box the array order
    order.push([gradient[i],x,y]);
    x = x + width;

    // Change row each size
    for (j = 1; j <= size; j++) {
      if (i == (size * j - 1)) {
        y = height * j;
        x = 0;
      }
    }
  }

  // Shuffel the play field after 3 seconds
  setTimeout(shuffleColor, 3000);
}

// Shuffels the play field
function shuffleColor() {
  // Copy the content from array order to push. This is necessary because the array order would also be shuffeld.
  for (i = 0; i < order.length; i++) {
    shuffled.push(order[i]);
  }
  shuffled = shuffle(shuffled);

  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");

  // Variables
  var i;
  var x = 0;
  var y = 0;
  var width = c.width / size;
  var height = c.height / size;

  // Draw the color boxes
  for (i = 0; i < size * size; i++) {
    ctx.fillStyle = shuffled[i][0];
    ctx.fillRect(x, y, width, height);
    x = x + width;

    // Change row each size
    for (j = 1; j <= size; j++) {
      if (i == (size * j - 1)) {
        y = height * j;
        x = 0;
      }
    }
  }
}

// Gets the positon of the mouse click and/or touch input
function getMousePosition(canvas, event) {
  // Variables
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");
  var width = c.width / size;
  var height = c.height / size;
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  var column = 0;
  var row = 0;

  // Checks coordinates for column
  for (i = 0; i < size; i++) {
    if (x > width * i && x < width * (i + 1)) {
      column = i + 1;
    }
  }

  // Checks coordinates for row
  for (i = 0; i < size; i++) {
    if (y > height * i && y < height * (i + 1)) {
      row = i + 1;
    }
  }

  // Gets colors from the two clicked boxes
  var ctx = canvas.getContext("2d");
  var colors = ctx.getImageData(x, y, 1, 1).data;
  var hex = "#" + ("000000" + rgbToHex(colors[0], colors[1], colors[2])).slice(-6);
  console.log("Coordinate x: " + x,
              "Coordinate y: " + y,
              "Color:" + hex,
              "Column:" + column,
              "Row:" + row);

  // Check if it's the first or second click
  if (firstClick == true) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 6;
    ctx.strokeRect(width * (column - 1) + 3, height * (row - 1) + 3.5, width - 6, height - 6.5);

    firstClick = false;
    color1 = hex;
    column1 = column;
    row1 = row;
  }

  else if (firstClick == false) {
    firstClick = true;
    color2 = hex;
    column2 = column;
    row2 = row;

    // If two click have been done, change the two colors
    changeColor(color1, column1, row1, color2, column2, row2);
  }
}

// Changes color after two clicks
function changeColor(color1, column1, row1, color2, column2, row2) {
  // Variables
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");
  var width = c.width / size;
  var height = c.height / size;

  // Draw color 1 two positon of box 2
  ctx.fillStyle = color1;
  ctx.fillRect(width * (column2 - 1), height * (row2 - 1), width, height);

  // Draw color 2 two positon of box 1
  ctx.fillStyle = color2;
  ctx.fillRect(width * (column1 - 1), height * (row1 - 1), width, height);

  // Play sound after each change
  soundClick.play();

  // Check in array order if the boxes have been moved to the correct place
  for (i = 0; i < order.length; i++) {
    // Click one was correct
    if ((column1 - 1) * width == order[i][1] && (row1 - 1) * height == order[i][2] && color2 == order[i][0]) {
      // Add white dot in the middle
      ctx.fillStyle = "white";
      ctx.fillRect((width * (column1 - 1) + width / 2 - 5), (height * (row1 - 1) + height / 2 - 5), 10, 10);
      // Play sound effect
      soundCorrect.play();
    }

    // Click two was correct
    if ((column2 - 1) * width == order[i][1] && (row2 - 1) * height == order[i][2] && color1 == order[i][0]) {
      // Add white dot in the middle
      ctx.fillStyle = "white";
      ctx.fillRect((width * (column2 - 1) + width / 2 - 5), (height * (row2 - 1) + height / 2 - 5), 10, 10);
      // Play sound effect
      soundCorrect.play();
    }
  }

  // Reset variables for changeColor
  color1 = 0;
  column1 = 0;
  row1 = 0;
  color2 = 0;
  column2 = 0;
  row2 = 0;
  moves++;

  // Update moves made in div
  document.getElementById("moves").innerHTML = "Moves<br><b>" + moves + "</b>";
}
