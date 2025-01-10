let R;  // will hold the Random class instance

// Recommended class for randomness; remove unneeded functionality
class Random {
    constructor() {
        let offset = 0;
        for (let i = 2; i < 66; i += 8) offset += parseInt(inputData.hash.substr(i, 8), 16);
        offset %= 7;

        const p = pos => parseInt(inputData.hash.substr((pos + offset), 8), 16);
        let a = p(2) ^ p(34), b = p(10) ^ p(42), c = p(18) ^ p(50), d = p(26) ^ p(58) ^ p(2 + (8 - offset));

        this.r = () => {
            a |= 0; b |= 0; c |= 0; d |= 0;
            let t = (((a + b) | 0) + d) | 0;
            d = (d + 1) | 0; a = b ^ (b >>> 9);
            b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11);
            c = (c + t) | 0;
            return (t >>> 0) / 4294967296;
        };
        // 256 warmup cycles
        for (let i = 0; i < 256; i++) this.r();
    }
    // Random decimal [0, 1)
    random_dec = () => this.r();
    // Random number [a, b)
    random_num = (a, b) => a + (b - a) * this.random_dec();
    // Random integer [a, b] (a < b required)
    random_int = (a, b) => Math.floor(this.random_num(a, b + 1));
    // Random boolean (p = true probability)
    random_bool = (p) => this.random_dec() < p;
    // Choose random item from array
    random_choice = (list) => list[this.random_int(0, list.length - 1)];
}
let c;
function setup() {
    // Set aspect ratio
    let aspectRatio = 0.75;

    // Set pixel density; normalizing the p5js canvas
    pixelDensity(displayDensity());

    // Calculate dimensions
    let ih = windowHeight;
    let iw = windowWidth;

    if (iw / ih < aspectRatio) {
        c = createCanvas(iw, iw / aspectRatio);
    } else {
        c = createCanvas(ih * aspectRatio, ih);
    }

    // Initiate Random class
    R = new Random();

    // Create white background
    background(255);
}

function draw() {
    // Traits defined in traits.js; live from chain
    let amountOfLines = parseInt(inputData["Amount Of Lines"].value);
    let color = inputData["Paint Color"].value;

    // Create white background
    background(255);

    // Color from trait
    stroke(color);

    // Use dimension-agnostic variables (e.g., lineWidth based on canvas width)
    strokeWeight(width * 0.05);

    for (let i = 0; i < amountOfLines; i++) {
        // Examples using the Random class
        let startX = width * R.random_dec();
        let startY = height * R.random_dec();
        let endX = width * R.random_dec();
        let endY = height * R.random_dec();

        // Draw line
        line(startX, startY, endX, endY);
    }

    // Draw border
    noFill();
    rect(0, 0, width, height);
    noLoop();

    // Set window.rendered to canvas when done rendering
    // Image generation scripts use this for still images
    window.rendered = c.canvas;
}

new p5();