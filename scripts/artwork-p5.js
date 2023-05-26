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


let random, c;

function setup() {
    let n = windowHeight,
        r = windowWidth;
    c = n / r < 1.35 ? createCanvas(n / 1.35, n) : createCanvas(r, 1.35 * r);
    random = new Random();
}

function draw() {
    let n = parseInt(inputData["Amount Of Lines"]),
        r = inputData["Paint Color"];
    background(255);
    stroke(r);
    strokeWeight(0.05 * width);
    for (let t = 0; t < n; t++) {
        let e = width * random.random_dec(),
            o = height * random.random_dec(),
            s;
        line(e, o, width * random.random_dec(), height * random.random_dec());
    }
    noFill();
    rect(0, 0, width, height);
    window.rendered = c.canvas;
    noLoop();
}

new p5();
