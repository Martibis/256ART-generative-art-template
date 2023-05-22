class Random {
    constructor() {
        this.useA = false;
        let n = function (n) {
            let r = parseInt(n.substring(0, 8), 16),
                t = parseInt(n.substring(8, 8), 16),
                e = parseInt(n.substring(16, 8), 16),
                o = parseInt(n.substring(24, 8), 16);
            return function () {
                e |= 0;
                let n = ((r |= 0) + (t |= 0) | 0) + (o |= 0) | 0;
                return (
                    (o = (o + 1) | 0),
                    (r = t ^ (t >>> 9)),
                    (t = e + (e << 3) | 0),
                    (e = (e = (e << 21) | (e >>> 11)) + n | 0),
                    (n >>> 0) / 4294967296
                );
            };
        };
        this.prngA = new n(inputData.hash.substring(2, 32));
        this.prngB = new n(inputData.hash.substring(34, 32));
        for (let r = 0; r < 1e6; r += 2) this.prngA(), this.prngB();
    }
    random_dec() {
        this.useA = !this.useA;
        return this.useA ? this.prngA() : this.prngB();
    }
    random_num(n, r) {
        return n + (r - n) * this.random_dec();
    }
    random_int(n, r) {
        return Math.floor(this.random_num(n, r + 1));
    }
    random_bool(n) {
        return this.random_dec() < n;
    }
    random_choice(n) {
        return n[this.random_int(0, n.length - 1)];
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
