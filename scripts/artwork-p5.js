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
        this.prng = sfc32(inputData.hash);
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
