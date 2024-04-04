// TODO: SPLIT CANVAS BY PERLIN NOISE, ONLY SELECT POINTS IN PERLIN NOISE FIELD
// TODO: split canvas in two
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
}

// Set aspect ratio
let aspectRatio = 0.75/* 9 / 16 */;

function setup() {
  console.log(inputData.hash);

  let dp = window.devicePixelRatio;

  // Calculate dimensions
  let ih = window.innerHeight * dp;
  let iw = window.innerWidth * dp;

  if (iw / ih < aspectRatio) {
    canvas.width = iw;
    canvas.height = iw / aspectRatio;
  } else {
    canvas.height = ih;
    canvas.width = ih * aspectRatio;
  }
  document.body.appendChild(canvas);
}

async function draw() {
  // Remove in p5js
  let ctx = canvas.getContext("2d");

  // Initiate Random class
  let R = new Random();
  let w = canvas.width;
  let h = canvas.height;

  let borderSize = w * 0.02;
  var DELAUNAY_EPSILON = 1.0 / 1048576.0;

  let flipHorizontally = R.r() > 0.5;
  let flipVertically = R.r() > 0.5;
  function flipCanvas(context, canvasWidth, canvasHeight) {
    context.save(); // Save the current state

    if (flipHorizontally) {
      // Flip horizontally
      context.translate(canvasWidth, 0); // Move the context to the right by the canvas width
      context.scale(-1, 1); // Flip horizontally
    }

    if (flipVertically) {
      // Flip vertically
      context.translate(0, canvasHeight); // Move the context down by the canvas height
      context.scale(1, -1); // Flip vertically
    }

    // ... Perform your drawing operations here ...

    context.restore(); // Restore the original state
  }


  function delaunayTriangulate(vertices, key) {
    var n = vertices.length;
    var i, j;
    var dx, dy;
    var a, b, c;
    var indices, st, open, closed, edges;
    if (n < 3) return [];
    vertices = vertices.slice(0);

    if (key) {
      for (i = n; i--;) {
        vertices[i] = vertices[i][key];
      }
    }
    indices = new Array(n);
    for (i = n; i--;) {
      indices[i] = i;
    }
    indices.sort(function (i, j) {
      var diff = vertices[j][0] - vertices[i][0];
      return diff !== 0 ? diff : i - j;
    });
    st = supertriangle(vertices);
    vertices.push(st[0], st[1], st[2]);
    open = [circumcircle(vertices, n + 0, n + 1, n + 2)];
    closed = [];

    edges = [];
    for (i = indices.length; i--; edges.length = 0) {
      c = indices[i];
      for (j = open.length; j--;) {
        dx = vertices[c][0] - open[j].x;
        if (dx > 0.0 && dx * dx > open[j].r) {
          closed.push(open[j]);
          open.splice(j, 1);
          continue;
        }
        dy = vertices[c][1] - open[j].y;
        if (dx * dx + dy * dy - open[j].r > DELAUNAY_EPSILON) continue;

        edges.push(
          open[j].i, open[j].j,
          open[j].j, open[j].k,
          open[j].k, open[j].i
        );
        open.splice(j, 1);
      }

      dedup(edges);

      /* Add a new triangle for each edge. */
      for (j = edges.length; j;) {
        b = edges[--j];
        a = edges[--j];
        open.push(circumcircle(vertices, a, b, c));
      }
    }

    for (i = open.length; i--;) {
      closed.push(open[i]);
    }
    open.length = 0;
    for (i = closed.length; i--;) {
      if (closed[i].i < n && closed[i].j < n && closed[i].k < n) {
        open.push(closed[i].i, closed[i].j, closed[i].k);
      }
    }

    return open;
  }

  //---------------------------------------------------
  function dedup(edges) {
    for (var j = edges.length; j;) {
      var b = edges[--j];
      var a = edges[--j];
      for (var i = j; i;) {
        var n = edges[--i];
        var m = edges[--i];
        if ((a === m && b === n) || (a === n && b === m)) {
          edges.splice(j, 2);
          edges.splice(i, 2);
          break;
        }
      }
    }
  }

  //---------------------------------------------------
  function circumcircle(vertices, i, j, k) {
    var x1 = vertices[i][0];
    var y1 = vertices[i][1];
    var x2 = vertices[j][0];
    var y2 = vertices[j][1];
    var x3 = vertices[k][0];
    var y3 = vertices[k][1];
    var fabsy1y2 = Math.abs(y1 - y2);
    var fabsy2y3 = Math.abs(y2 - y3);
    var xc, yc, m1, m2;
    var mx1, mx2, my1, my2;
    if (fabsy1y2 < DELAUNAY_EPSILON && fabsy2y3 < DELAUNAY_EPSILON) {
      return; // throw new Error("Eek! Coincident points!");
    }
    if (fabsy1y2 < DELAUNAY_EPSILON) {
      m2 = -((x3 - x2) / (y3 - y2));
      mx2 = (x2 + x3) / 2.0;
      my2 = (y2 + y3) / 2.0;
      xc = (x2 + x1) / 2.0;
      yc = m2 * (xc - mx2) + my2;
    } else if (fabsy2y3 < DELAUNAY_EPSILON) {
      m1 = -((x2 - x1) / (y2 - y1));
      mx1 = (x1 + x2) / 2.0;
      my1 = (y1 + y2) / 2.0;
      xc = (x3 + x2) / 2.0;
      yc = m1 * (xc - mx1) + my1;
    } else {
      m1 = -((x2 - x1) / (y2 - y1));
      m2 = -((x3 - x2) / (y3 - y2));
      mx1 = (x1 + x2) / 2.0;
      mx2 = (x2 + x3) / 2.0;
      my1 = (y1 + y2) / 2.0;
      my2 = (y2 + y3) / 2.0;
      xc = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
      yc = fabsy1y2 > fabsy2y3 ? m1 * (xc - mx1) + my1 : m2 * (xc - mx2) + my2;
    }
    var dx = x2 - xc;
    var dy = y2 - yc;
    return { i: i, j: j, k: k, x: xc, y: yc, r: dx * dx + dy * dy };
  }

  //---------------------------------------------------
  function supertriangle(vertices) {
    var xmin = Number.POSITIVE_INFINITY;
    var ymin = Number.POSITIVE_INFINITY;
    var xmax = Number.NEGATIVE_INFINITY;
    var ymax = Number.NEGATIVE_INFINITY;
    for (var i = vertices.length; i--;) {
      if (vertices[i][0] < xmin) xmin = vertices[i][0];
      if (vertices[i][0] > xmax) xmax = vertices[i][0];
      if (vertices[i][1] < ymin) ymin = vertices[i][1];
      if (vertices[i][1] > ymax) ymax = vertices[i][1];
    }
    var dx = xmax - xmin;
    var dy = ymax - ymin;
    var dmax = Math.max(dx, dy);
    var xmid = xmin + dx * 0.5;
    var ymid = ymin + dy * 0.5;
    return [
      [xmid - 20 * dmax, ymid - dmax],
      [xmid, ymid + 20 * dmax],
      [xmid + 20 * dmax, ymid - dmax],
    ];
  }

  let oneSizeBigger = 0.1;

  /* function generateRandomPoints(numPoints, canvasWidth, canvasHeight, useMargin) {
    let margin = useMargin ? canvasWidth * oneSizeBigger : 0;
    let makeOnesAtSideBigger = useMargin ? true : R.r() > 0.9;
    const w = canvasWidth - margin;
    const h = canvasHeight - margin;

    // Adjusting initial points to be within the margin if useMargin is true
    let points = [
      [margin, margin],
      [margin, h],
      [w, margin],
      [w, h]
    ];

    margin = makeOnesAtSideBigger ? canvasWidth * oneSizeBigger : 0;

    // Adjusting the range for generating inner points to be another margin away
    const innerMargin = 2 * margin;

    for (let i = 0; i < numPoints; i++) {
      points.push([
        innerMargin + R.r() * (canvasWidth - innerMargin * 2),
        innerMargin + R.r() * (canvasHeight - innerMargin * 2)
      ]);
    }
    return points;
  } */

  function generateRandomPoints(numPoints, canvasWidth, canvasHeight, useMargin, biasFactor) {
    let oneSizeBigger = 0.2; // Define this as per your requirement
    let margin = useMargin ? canvasWidth * oneSizeBigger : borderSize * 3;
    let makeOnesAtSideBigger = useMargin ? true : R.r() > 0.95;

    // Adjusting initial corner points based on the margin
    let points = [
      [margin, margin],
      [margin, canvasHeight - margin],
      [canvasWidth - margin, margin],
      [canvasWidth - margin, canvasHeight - margin]
    ];

    // Adjusting the range for generating inner points
    let innerMargin = makeOnesAtSideBigger ? canvasWidth * oneSizeBigger : margin;

    const skewRandom = (bias, max) => {
      let rand = R.r();
      rand = 0.5 * Math.pow(rand * 2, Math.exp(bias));
      return rand * max;
    };

    for (let i = 0; i < numPoints; i++) {
      let x = skewRandom(biasFactor, canvasWidth - innerMargin * 2) + innerMargin;
      let y = skewRandom(biasFactor, canvasHeight - innerMargin * 2) + innerMargin;

      // Reflecting points across the center to ensure symmetry
      if (R.r() > 0.5) x = canvasWidth - (x - innerMargin) - innerMargin;
      if (R.r() > 0.5) y = canvasHeight - (y - innerMargin) - innerMargin;

      points.push([x, y]);
    }
    return points;
  }








  let pointsRandomizer = R.r();
  let pointsMultiplier;

  if (pointsRandomizer < 0.05) {
    pointsMultiplier = 0;
  } else {
    if (pointsRandomizer < 0.15) {
      pointsMultiplier = 1;
    } else {
      if (pointsRandomizer < 0.325) {
        pointsMultiplier = 2;
      } else {
        if (pointsRandomizer < 0.575) {
          pointsMultiplier = 3;
        } else {
          if (pointsRandomizer < 0.85) {
            pointsMultiplier = 4;
          } else {
            if (pointsRandomizer < 0.95) {
              pointsMultiplier = 5;
            } else {
              pointsMultiplier = 6;
            }
          }
        }
      }
    }
  }

  let numPoints = R.r() * R.r() * 500 + Math.ceil(2 * R.r());
  console.log(numPoints);

  let useMargin = R.r() > 0.95;

  numPoints = useMargin ? Math.round(numPoints * 0.8) : numPoints;

  const points = generateRandomPoints(numPoints, w, h, useMargin, -1 * R.r() * R.r());

  let triangles = delaunayTriangulate(points);
  //TODO FIX THIS LATER


  function shuffleTrianglePoints(triangle) {
    for (let i = triangle.length - 1; i > 0; i--) {
      const j = Math.floor(R.r() * (i + 1));
      [triangle[i], triangle[j]] = [triangle[j], triangle[i]];
    }
    return triangle;
  }

  function shuffleTriangles(triangles) {
    const shuffledTriangles = [];
    for (let i = 0; i < triangles.length; i += 3) {
      const triangle = [triangles[i], triangles[i + 1], triangles[i + 2]];
      shuffledTriangles.push(...shuffleTrianglePoints(triangle));
    }
    return shuffledTriangles;
  }

  triangles = R.r() > 0.4 ? shuffleTriangles(triangles) : triangles;



  let counters = 1 + Math.ceil(numPoints / (4 + 4 * R.r()));
  let counterFrames = [];
  let countersAll = [];

  let frameRate = 30;

  for (let i = 0; i < counters; i++) {
    counterFrames.push(frameRate);
    countersAll.push(Math.round(counterFrames[i] * R.r() * triangles.length / 3));
  }

  function randomizeMidPoint(x1, y1, x2, y2, randomness) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const offsetX = (R.r() - 0.5) * randomness * w;
    const offsetY = (R.r() - 0.5) * randomness * w;
    return { mx: midX + offsetX, my: midY + offsetY };
  }

  /* if (!fillOutlines) {
    outlines = Math.ceil(outlines / 2);
  } */

  let addShadows = R.r() > 0.6;
  let second = true;

  async function drawShapes(ctx, points, triangles, first) {
    for (let i = 0; i < counters; i++) {
      countersAll[i]++;
      let jump = R.r() > 0.9;
      if (jump) {
        countersAll[i] + frameRate;
      }
      if (countersAll[i] > (triangles.length / 3) * counterFrames[i]) {
        countersAll[i] = 0;
      }
    }
    for (let i = 0; i < triangles.length; i += 3) {
      let run;
      if (fullCounter < 2) {
        run = false;
      } else {
        for (let j = 0; j < counters; j++) {
          if (Math.round(i / 3) == Math.round(countersAll[j] / counterFrames[j])) {
            run = true;
          }
        }
      }

      if (fillTriangle[Math.round(i / 3)]) {

        // Triangle vertices
        const x1 = points[triangles[i]][0];
        const y1 = points[triangles[i]][1];
        const x2 = points[triangles[i + 1]][0];
        const y2 = points[triangles[i + 1]][1];
        const x3 = points[triangles[i + 2]][0];
        const y3 = points[triangles[i + 2]][1];

        if (first) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2); // Curve from x1,y1 to x2,y2
          ctx.lineTo(x3, y3); // Curve from x2,y2 to x3,y3
          ctx.lineTo(x1, y1); // Curve from x3,y3 back to x1,y1
          ctx.closePath();
          ctx.save();
          ctx.clip();
          ctx.fill();
          await createFrame(Math.round(i / 3), first);

          if (addShadows) {
            ctx.globalAlpha = 0.25;
            ctx.lineWidth = borderSize * 4 / (0.075 * (numPoints + 4)) * (0.85 + R.r() * 0.25);
            ctx.strokeStyle = borderColor;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }

          ctx.lineWidth = borderSize / (0.05 * (numPoints + 0.5));
          ctx.strokeStyle = borderColor;
          ctx.stroke();
          ctx.restore();
        } else {
          for (let k = 0; k < outlines; k++) {
            // Calculate randomized midpoints for control points
            const mp1 = second ? mp1s[i][k] : randomizeMidPoint(x1, y1, x2, y2, midpointRandomizer * R.r());
            const mp2 = second ? mp2s[i][k] : randomizeMidPoint(x2, y2, x3, y3, midpointRandomizer * R.r());
            const mp3 = second ? mp3s[i][k] : randomizeMidPoint(x3, y3, x1, y1, midpointRandomizer * R.r());
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.bezierCurveTo(mp1.mx, mp1.my, mp2.mx, mp2.my, x2, y2); // Curve from x1,y1 to x2,y2
            ctx.bezierCurveTo(mp2.mx, mp2.my, mp3.mx, mp3.my, x3, y3); // Curve from x2,y2 to x3,y3
            ctx.bezierCurveTo(mp3.mx, mp3.my, mp1.mx, mp1.my, x1, y1); // Curve from x3,y3 back to x1,y1
            ctx.closePath();
            ctx.save();
            ctx.clip();
            /* ctx.fillStyle = innerBg;
            ctx.fill(); */

            if (fillOutlines) {
              ctx.fillStyle = innerBg;
              ctx.fill();
            }

            if (run) {
              await createFrame(Math.round(i / 3), first);
              k = outlines + 1;
              //await cBuffer.ctx.drawImage(canvas, 0, 0);
            } else {
              await ctx.drawImage(cBuffer, 0, 0);
              //await cBuffer.ctx.drawImage(canvas, 0, 0);
            }

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.bezierCurveTo(mp1.mx, mp1.my, mp2.mx, mp2.my, x2, y2); // Curve from x1,y1 to x2,y2
            ctx.bezierCurveTo(mp2.mx, mp2.my, mp3.mx, mp3.my, x3, y3); // Curve from x2,y2 to x3,y3
            ctx.bezierCurveTo(mp3.mx, mp3.my, mp1.mx, mp1.my, x1, y1); // Curve from x3,y3 back to x1,y1
            ctx.closePath();

            if (addShadows) {
              ctx.globalAlpha = 0.25;
              ctx.lineWidth = borderSize * 4 / (0.05 * (numPoints + 4)) * (0.85 + R.r() * 0.25);
              ctx.strokeStyle = borderColor;
              ctx.stroke();
              ctx.globalAlpha = 1;
            }

            ctx.lineWidth = borderSize / (0.05 * (numPoints + 1));
            ctx.strokeStyle = borderColor;
            ctx.stroke();

            ctx.restore();
          }
        }
      }

    }
    if (!first) {
      second = false;
    }
    console.log(counter);
    console.log(counterTwo);
  }

  const PERLIN_YWRAPB = 4;
  const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
  const PERLIN_ZWRAPB = 8;
  const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
  const PERLIN_SIZE = 8191;
  /* 
      let perlin_octaves = 2 + Math.round(R.r() * 6); // default to medium smooth
      let perlin_amp_falloff = 0.35 + R.r() * 0.25; // 50% reduction/octave
   */

  const scaled_cosine = (i) => 0.5 * (1.0 - Math.cos(i * Math.PI));

  let reverseStyleTwo = R.r() > 0.85;
  /* let reverseStyleThree = R.r() > 0.5; */
  let reverseStyle = R.r() > 0.5;
  let mainColor = reverseStyle ? '#fff' : "#000";
  /* let c1 = "#" + Math.floor(R.r() * 16777215).toString(16); // #000
 
  console.log(c1); */
  let palettes = [
    //Distant Shoreline
    ["#7a8b94", "#697a8f", "#d4b97e", "#b7766f"],
    //Stale Solitude -> EH
    ["#b58850", "#b0724f", "#c4beae", "#814c2a"],
    //Broken Bar Stool
    ["#87111d", "#b58850", "#c4beae"/* , "#121412" */],
    //Twilight Echoes -> GOOD
    ["#aeaca5", "#0b6b93", /* "#1a1c1e", */ "#a11f19"],
    //Ashen Memories
    ["#aeaca5", /* "#1a1c1e", */ "#623327", "#6998b3"],
    //Whispering Pines -> OKAY
    ["#225839", "#b55c27", "#5b140b", "#b9b57b"],
    //Ember Remnants
    ["#9a2600", "#9a5200", "#9a7652", "#4d7a7a"],
    //Blue Moon Sorrow -> GOOD
    ["#8d6e1e", "#364e66", /* "#141817", */ "#728d8b"],
    //Noir Shadows -> MAYBE
    /* ["#8d8a72", "#0f1b40", "#526c8f", "#0f1d2c"], */
    //Faded Manuscript -> MAYBE
    ["#27423a", "#a37e3c", "#92532f", "#3a848c"],
    //Last Call Lament -> GOOD
    ["#c01e2d", "#c16482", "#b29602", "#a3411c"],
    //Sunken Dreams
    ["#b71632", "#b25099", "#117fb2", "#267c38"],
    //Burnt Matchsticks -> GOOD
    ["#990100", "#0b3c73", "#ccbb01"],
    //Lonely Street -> PRETTY GOOD
    /* ["#070c07", "#0c1c14", "#0f2c1e", "#18393e"], */
    //Muted Silhouettes -> GOOD
    ["#303d30", "#1c3a1b", "#435c64", "#1d6676"],
    //Neon Reverie
    ["#9a434c", "#a97e28", /* "#041215", */ "#1d6676"],
    //Foggy Dawn -> GOOD
    ["#1d3927", "#3a5674", "#5f8c67", "#a89d1a"],
    //Moonlit Haze -> GOOD
    ["#6f92b4", "#646768", "#71726f", "#927c7b"],
    //Aged Whiskey
    ["#918f92", "#7e8fb4", "#b09a7c", "#bcb197"],
    ["#e8033c"],
    ['#b55673'],
    ['#3a71a2'],
    ['#1eaf8e'],
    ['#2c3b4c'],
    ['#d05d1f'],
    ['#dd7f00'],
    ['#E32636']
  ];



  /* palettes = [["#F7931A"]]; */

  let weightedPalettes = [];

  palettes.forEach(palette => {
    // If the palette has more than one color, add it twice
    if (palette.length > 1) {
      weightedPalettes.push(palette, palette, palette);
    } else {
      weightedPalettes.push(palette);
    }
  });

  let palette = weightedPalettes[Math.floor(weightedPalettes.length * R.r())];
  /* let palette = palettes[2]; */

  console.log(palette);

  let takePaletteColorForBg = false;//R.r() > 0.69;

  let colorBgColor;
  if (takePaletteColorForBg) {
    let indexToRemove = Math.floor(R.r() * palette.length); // index of item 3
    colorBgColor = palette.splice(indexToRemove, 1);
  }

  let bgColor = takePaletteColorForBg ? colorBgColor : (reverseStyleTwo ? '#111' : "#fff");
  let innerBg = "#444";
  let outerBorderColor = reverseStyleTwo ? '#fff' : "#111";

  console.log(palette);

  if (palette.length == 0) {
    palette.push("#111", "#fff");
  }

  console.log(palette);

  let nvCRanger = /* (reverseStyle) ? 0 :  */R.r();
  console.log(nvCRanger);

  let outlines = 2/*  + Math.round(2 * R.r()) */;
  let fillOutlines = takePaletteColorForBg ? true : (R.r() > 0.33);

  let perlins = [];
  let noiseSizers = [];
  let fillTypes = [];
  let reverseStyle2s = [];
  let perlin_octaves = []; // default to medium smooth
  let perlin_amp_falloffs = []; // 50% reduction/octave
  let nvC = [];
  let goDarker = [];
  let colors = [];
  let initialSteps = [];
  let fillTriangle = [];

  let fillTriangleRandomizer = R.r() * 0; // didn't like

  let rStyleIsSame = R.r() > 0.65;
  let rStyleThatIsSame = R.r();

  let nvcAt50 = R.r() > 0.35;
  let allSameNs = R.r() > 0.65;
  let sameNsLvl = 2500 + R.r() * 50000;

  let mp1s = [];
  let mp2s = [];
  let mp3s = [];

  let noiseBuffer;
  noiseBuffer = document.createElement("canvas");
  noiseBuffer.width = w;
  noiseBuffer.height = h;
  noiseBuffer.ctx = noiseBuffer.getContext("2d");

  let showNoise = true;

  for (let i = 0; i < 175000; i++) {
    noiseBuffer.ctx.globalAlpha = 0.05 + 0.05 * R.r();
    noiseBuffer.ctx.fillStyle = takePaletteColorForBg ? "#000" : (reverseStyleTwo ? "#a0a0a0" : "#7c7c7c");
    noiseBuffer.ctx.beginPath()
    noiseBuffer.ctx.arc(w * R.r(), h * R.r(), w * 0.0005 + w * 0.0005 * R.r(), 0, 2 * Math.PI);
    noiseBuffer.ctx.closePath()
    noiseBuffer.ctx.fill()
  }


  let midpointRandomizer = 0.425 * R.r() * R.r() * R.r() + 0.025;

  for (let i = 0; i < triangles.length; i += 3) {
    perlins.push(new Array(PERLIN_SIZE + 1));
    noiseSizers.push(allSameNs ? sameNsLvl : (2500 + R.r() * 50000));
    fillTypes.push(R.r() * 4);
    reverseStyle2s.push(rStyleIsSame ? (rStyleThatIsSame < 0.4) : (R.r() < 0.4));
    perlin_octaves.push(3 + Math.round(R.r() * 5));
    perlin_amp_falloffs.push(0.4 + 0.2 * R.r());
    nvC.push(nvcAt50 ? 0.5 : R.r());
    goDarker.push(R.r() > 0.5);
    colors.push(palette[Math.floor(R.r() * palette.length)]);
    initialSteps.push(w / (50 + 250 * R.r()));
    fillTriangle.push(R.r() > fillTriangleRandomizer);

    const x1 = points[triangles[i]][0];
    const y1 = points[triangles[i]][1];
    const x2 = points[triangles[i + 1]][0];
    const y2 = points[triangles[i + 1]][1];
    const x3 = points[triangles[i + 2]][0];
    const y3 = points[triangles[i + 2]][1];

    mp1s[i] = [];
    mp2s[i] = [];
    mp3s[i] = [];
    for (let k = 0; k < outlines; k++) {
      // Calculate randomized midpoints for control points
      const mp1 = randomizeMidPoint(x1, y1, x2, y2, midpointRandomizer * R.r());
      mp1s[i].push(mp1);
      const mp2 = randomizeMidPoint(x2, y2, x3, y3, midpointRandomizer * R.r());
      mp2s[i].push(mp2);
      const mp3 = randomizeMidPoint(x3, y3, x1, y1, midpointRandomizer * R.r());
      mp3s[i].push(mp3);
    }
  }

  for (let j = 0; j < perlins.length; j++) {
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
      perlins[j][i] = R.r();
    }
  }

  function noise(x, y = 0, perlin, perlin_octaves, perlin_amp_falloff) {
    let z = 0;
    if (x < 0) {
      x = -x;
    }
    if (y < 0) {
      y = -y;
    }
    if (z < 0) {
      z = -z;
    }

    let xi = Math.floor(x),
      yi = Math.floor(y),
      zi = Math.floor(z);
    let xf = x - xi;
    let yf = y - yi;
    let zf = z - zi;
    let rxf, ryf;

    let r = 0;
    let ampl = 0.5;

    let n1, n2, n3;

    for (let o = 0; o < perlin_octaves; o++) {
      let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);

      rxf = scaled_cosine(xf);
      ryf = scaled_cosine(yf);

      n1 = perlin[of & PERLIN_SIZE];
      n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
      n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
      n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
      n1 += ryf * (n2 - n1);

      of += PERLIN_ZWRAP;
      n2 = perlin[of & PERLIN_SIZE];
      n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
      n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
      n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
      n2 += ryf * (n3 - n2);

      n1 += scaled_cosine(zf) * (n2 - n1);

      r += n1 * ampl;
      ampl *= perlin_amp_falloff;
      xi <<= 1;
      xf *= 2;
      yi <<= 1;
      yf *= 2;
      zi <<= 1;
      zf *= 2;

      if (xf >= 1.0) {
        xi++;
        xf--;
      }
      if (yf >= 1.0) {
        yi++;
        yf--;
      }
      if (zf >= 1.0) {
        zi++;
        zf--;
      }
    }
    return r;
  }

  // Create white background
  let borderColor = reverseStyleTwo ? "#fff" : "#000";
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);
  if (takePaletteColorForBg) {
    ctx.drawImage(noiseBuffer, 0, 0);

  }

  let counter = 0;
  let counterTwo = 0;

  let widthScalerOne = 0.5 + R.r() * 1;
  let widthScalerSame = R.r() > 0.5;
  let widthScalerTwo = widthScalerSame ? widthScalerOne : 0.75 + R.r() * 1.5;

  let heightOneSameAsWidth = R.r() > 0.6;
  let heightTwoSameAsWidth = R.r() > 0.6;

  let heightOneCircles = R.r() > 0.6;
  let heightTwoCircles = R.r() > 0.6;

  let strokeInner = R.r() > 0.5;

  let makeFlu = outlines > 1 ? R.r() > 0.4 : false;

  let hasFill = R.r() < 0.92;

  async function createFrame(perlinSelector, first) {
    ctx.clearRect(0, 0, w, h);
    let xOff = 0;

    let step = first ? initialSteps[perlinSelector] : (w / (50 + 250 * R.r()));
    step = parseFloat(step.toFixed(4)); // or another suitable number of decimal places


    let yShift = false;
    let xShift = false;

    let finalxOffValue;
    let finalyOffValue;
    let finalNs = noiseSizers[perlinSelector];

    for (
      var x = 0;
      x <= w + step;
      x += step
    ) {
      yShift = !yShift;
      let yOff = 0;

      /* counterTwo++; */
      for (
        var y = 0;
        y <= h + step;
        y += step
      ) {
        xShift = !xShift;
        finalxOffValue = xOff;
        finalyOffValue = yOff;

        let noiseValue = noise(finalxOffValue, finalyOffValue, perlins[perlinSelector], perlin_octaves[perlinSelector], perlin_amp_falloffs[perlinSelector]);


        if (hasFill) {
          if (noiseValue > nvC[perlinSelector]) {
            if (fillTypes[perlinSelector] < 1) {
              if (noiseValue < 0.4 || noiseValue > 0.6) {
                ctx.fillStyle = mainColor;
              } else {
                ctx.fillStyle = colors[perlinSelector];
              }
            } else {
              //nvC + nvC / 2
              if (fillTypes[perlinSelector] < 2) {
                if (noiseValue > 0.4 && noiseValue < 0.6) {
                  ctx.fillStyle = mainColor;
                } else {
                  ctx.fillStyle = colors[perlinSelector];
                }
              } else {
                if (fillTypes[perlinSelector] < 3) {
                  if (noiseValue < nvC[perlinSelector] + nvC[perlinSelector] / 2) {
                    ctx.fillStyle = mainColor;
                  } else {
                    ctx.fillStyle = colors[perlinSelector];
                  }
                } else {
                  if (fillTypes[perlinSelector] < 4) {
                    if (noiseValue > nvC[perlinSelector] + nvC[perlinSelector] / 2) {
                      ctx.fillStyle = mainColor;
                    } else {
                      ctx.fillStyle = colors[perlinSelector];
                    }
                  }
                }
              }
            }

            ctx.globalAlpha = makeFlu ? (noiseValue + 0.25) : 1;
            ctx.lineWidth = (w / (375 * (reverseStyle2s[perlinSelector] ? (1 + R.r() * noiseValue / 2) : 1)) * widthScalerOne) / 10;
            ctx.strokeStyle = borderColor;

            if (heightOneSameAsWidth && (heightOneCircles)) {
              ctx.beginPath();
              ctx.arc(x, y, (w / (375 * (reverseStyle2s[perlinSelector] ? (1 + R.r() * noiseValue / 2) : 1)) * widthScalerOne * 2) / 2, 0, Math.PI * 2);
              ctx.closePath();

            } else {
              ctx.beginPath();
              ctx.rect(x, y, w / (375 * (reverseStyle2s[perlinSelector] ? (1 + R.r() * noiseValue / 2) : 1)) * widthScalerOne, heightOneSameAsWidth ? (w / (375 * (reverseStyle2s[perlinSelector] ? (1 + R.r() * noiseValue / 2) : 1)) * widthScalerOne) : (h / (10 * R.r() + 5)));
              ctx.closePath();

            }
            ctx.fill();
            if (strokeInner) {
              ctx.stroke();
            }
            //ctx.fillRect(x, y, w / (375 * (reverseStyle2s[perlinSelector] ? (1 + R.r() * noiseValue / 2) : 1)) * widthScalerOne, heightOneSameAsWidth ? (w / (375 * (reverseStyle2s[perlinSelector] ? (1 + R.r() * noiseValue / 2) : 1)) * widthScalerOne) : (h / (3 * R.r() + 3)));
            //ctx.globalAlpha = 1;
          } else {
            //ctx.globalAlpha = noiseValue;
            ctx.fillStyle = innerBg;
            if (heightTwoSameAsWidth && (heightTwoCircles)) {
              ctx.beginPath();
              ctx.arc(x, y, (w / (375 * (reverseStyle2s[perlinSelector] ? (1 + R.r() * noiseValue / 2) : 1)) * widthScalerTwo * 2) / 2, 0, Math.PI * 2);
              ctx.closePath();
            } else {
              ctx.beginPath();
              ctx.rect(x, y, w / (375 * (reverseStyle2s[perlinSelector] ? (1 + R.r() * noiseValue / 2) : 1)) * widthScalerTwo, heightTwoSameAsWidth ? (w / (375 * (reverseStyle2s[perlinSelector] ? (1 + R.r() * noiseValue / 2) : 1)) * widthScalerTwo) : (h / (10 * R.r() + 5)));
              ctx.closePath();
            }
            ctx.fill();
            if (strokeInner) {
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;


        yOff +=
          (w / step) / finalNs;

        if (y == 0) {
          counter++;
        }
      }

      xOff +=
        ((w / step) / aspectRatio) /
        finalNs;
    }
    if (goDarker[perlinSelector]) {
      nvC[perlinSelector] -= 0.001;
    } else {
      nvC[perlinSelector] += 0.001;
    }
    if (nvC[perlinSelector] > 0.75 || nvC[perlinSelector] < 0.25) {
      goDarker[perlinSelector] = !goDarker[perlinSelector];
    }
  }

  window.rendered = canvas;

  let now;
  let elapsed = 0;
  let fpsInterval = 90;
  let then = performance.now();
  let fullCounter = 0;

  async function animateCanvas() {
    now = performance.now();
    elapsed = now - then;
    fullCounter++;

    if (fullCounter < 2 || ((elapsed > fpsInterval || elapsed == 0) && a)) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
      await drawShapes(ctx, points, triangles, false);

      ctx.fillStyle = outerBorderColor;
      ctx.fillRect(0, 0, borderSize, h);
      ctx.fillRect(0, 0, w, borderSize);
      ctx.fillRect(w - borderSize, 0, borderSize, h);
      ctx.fillRect(0, h - borderSize, w, borderSize);

      ctx.fillStyle = bgColor;
      ctx.fillRect(borderSize, borderSize, borderSize * 2, h - borderSize * 3);
      ctx.fillRect(borderSize, borderSize, w - borderSize * 3, borderSize * 2);
      ctx.fillRect(w - borderSize * 3, borderSize, borderSize * 2, h - borderSize * 3);
      ctx.fillRect(borderSize, h - borderSize * 3, w - borderSize * 2, borderSize * 2);

      if (showNoise) {
        ctx.drawImage(noiseBuffer, 0, 0);
      }
      flipCanvas(ctx, w, h);
    }

    then = now - (elapsed % fpsInterval);
    requestAnimationFrame(animateCanvas);
  }

  let cBuffer;
  cBuffer = document.createElement("canvas");
  cBuffer.width = w;
  cBuffer.height = h;
  cBuffer.ctx = cBuffer.getContext("2d");

  await drawShapes(ctx, points, triangles, true);
  await cBuffer.ctx.drawImage(canvas, 0, 0);

  ctx.fillStyle = outerBorderColor;
  ctx.fillRect(0, 0, borderSize, h);
  ctx.fillRect(0, 0, w, borderSize);
  ctx.fillRect(w - borderSize, 0, borderSize, h);
  ctx.fillRect(0, h - borderSize, w, borderSize);

  ctx.fillStyle = bgColor;
  ctx.fillRect(borderSize, borderSize, borderSize * 2, h - borderSize * 3);
  ctx.fillRect(borderSize, borderSize, w - borderSize * 3, borderSize * 2);
  ctx.fillRect(w - borderSize * 3, borderSize, borderSize * 2, h - borderSize * 3);
  ctx.fillRect(borderSize, h - borderSize * 3, w - borderSize * 2, borderSize * 2);

  if (showNoise) {
    ctx.drawImage(noiseBuffer, 0, 0);
  }

  flipCanvas(ctx, w, h);

  /* await cBuffer.ctx.drawImage(canvas, 0, 0); */

  await animateCanvas();
  // saveAndRefreshCanvas();

  function saveAndRefreshCanvas() {
    // Convert the canvas content to a data URL (PNG image)
    let dataURL = canvas.toDataURL('image/png');

    // Create a temporary link to trigger the download
    let tempLink = document.createElement('a');
    tempLink.href = dataURL;
    tempLink.download = `${inputData.hash}.png`; // Name of the file
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 5000); // Refresh after 5 seconds
  }

  // Call this function where you need to save and refresh
  //saveAndRefreshCanvas();




  document.addEventListener("keydown", async function (event) {
    const key = event.key;
    if (key == "a") {
      if (fullCounter > 2) {
        a = !a
        if (a) {
          now = performance.now();
          elapsed = now - then;
          animateCanvas();
        }
      }
    }
  });
}

let a = false;
let p = false;
let canvas = document.createElement("canvas");
setup();
draw();