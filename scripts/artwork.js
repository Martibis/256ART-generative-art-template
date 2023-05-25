// Recommended class for randomness; remove unneeded functionality
class Random {
  constructor() {
    let sfc32 = function (hex256) {
      let a = parseInt(hex256.substr(2, 8), 16) ^ parseInt(hex256.substr(34, 8), 16);
      let b = parseInt(hex256.substr(10, 8), 16) ^ parseInt(hex256.substr(42, 8), 16);
      let c = parseInt(hex256.substr(18, 8), 16) ^ parseInt(hex256.substr(50, 8), 16);
      let d = parseInt(hex256.substr(26, 8), 16) ^ parseInt(hex256.substr(58, 8), 16);

      return function () {
        a |= 0;
        b |= 0;
        c |= 0;
        d |= 0;
        let t = (((a + b) | 0) + d) | 0;
        d = (d + 1) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
      };
    };
    this.prng = sfc32(hash);
  }
  // Random decimal [0, 1)
  random_dec() {
    return this.prng();
  }
  // Random number [a, b)
  random_num(a, b) {
    return a + (b - a) * this.random_dec();
  }
  // Random integer [a, b] (a < b required)
  random_int(a, b) {
    return Math.floor(this.random_num(a, b + 1));
  }
  // Random boolean (p = true probability)
  random_bool(p) {
    return this.random_dec() < p;
  }
  // Choose random item from array
  random_choice(list) {
    return list[this.random_int(0, list.length - 1)];
  }
}

function setup() {
  // Set aspect ratio
  let aspectRatio = 1.35;

  let dp = window.devicePixelRatio;

  // Calculate dimensions
  let ih = window.innerHeight * dp;
  let iw = window.innerWidth * dp;

  if (ih / iw < aspectRatio) {
    canvas.height = ih;
    canvas.width = ih / aspectRatio;
  } else {
    canvas.width = iw;
    canvas.height = iw * aspectRatio;
  }
  document.body.appendChild(canvas);
}

function draw() {
  // Traits defined in traits.js; live from chain
  let amountOfLines = parseInt(inputData["Amount Of Lines"]);
  let color = inputData["Paint Color"];

  // Remove in p5js
  let ctx = canvas.getContext("2d");

  // Initiate Random class
  let R = new Random();

  // Create white background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Color from trait
  ctx.strokeStyle = color;

  // Use dimension-agnostic variables (e.g., lineWidth based on canvas width)
  ctx.lineWidth = canvas.width * 0.05;

  for (let i = 0; i < amountOfLines; i++) {
    // Examples using the Random class
    let startX = canvas.width * R.random_dec();
    let startY = canvas.height * R.random_dec();
    let endX = canvas.width * R.random_dec();
    let endY = canvas.height * R.random_dec();

    // Draw line
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  // Draw border
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.stroke();

  // Set window.rendered to canvas when done rendering
  // Image generation scripts use this for still images
  window.rendered = canvas;
}

let canvas = document.createElement("canvas");
setup();
draw();