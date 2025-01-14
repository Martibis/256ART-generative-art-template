## 256ART Generative Art Template

This is a template for creating generative art to be released fully in-chain via 256ART.

### Getting Started

To get started with this template, follow these steps:

1. Clone or download the repository.
2. Modify artwork.js or artwork-p5.js to create your artwork. If p5 is detected, it will use artwork-p5.js (enable p5.js by uncommenting the CDN in index.html). Remember, due to browser security measures, you need to run this on a local server when testing. In Visual Studio Code, the Live Server extension makes this process easier. After installation, simply click "Go Live" at the bottom to start the server and open your default browser.
3. Open the `traits.json` file and modify the code to define the traits that should be stored on-chain.
4. Access the traits defined in `traits.json` from `artwork.js` or `artwork-p5.js` using the `inputData` object.
5. Minify the `artwork.js` or `artwork-p5.js` and `traits.json` files using a tool such as [MinifyAll](https://marketplace.visualstudio.com/items?itemName=Luub.minifyall) in Visual Studio Code.
6. Upload the minified `artwork.js` or `artwork-p5.js` and `traits.json` files to the 256ART website.
7. Fill out the form on the website and submit it to create the transactions for creating the art on-chain.

### File Structure

- `artwork.js` or `artwork-p5.js`: This file contains the code for generating the generative art. This is the file that you should modify. Make sure to minify it before uploading to 256ART.
- `traits.json`: This file contains the code that defines the traits that should be stored on-chain.
- `inputData.js`: This file emulates how traits would be added from the chain. You should not modify this file.
- `index.html`: This file contains the code for displaying the generative art on the website. You can add libraries CDN scripts to this file, but only those that can be found on EthFS.
- `batch-generator.html`: This file contains the code for generating batch images for testing purposes. You should not modify this file, but can run it to generate a batch of previews.

### Creating the Generative Art

The `artwork.js` / `artwork-p5.js` file contains the code for generating the generative art. You should modify this code to create your desired generative art.

The output must be dimension agnostic, meaning it scales seamlessly to any dimension. While you can control the dimension ratio (e.g. width/height can be 1.0, 1.5, 0.75 etc.) you have no control over the dimensions of the browser someone else might be using. At lower resolutions, fewer pixels may limit what your output looks like, such as the smoothness of lines, which is okay. This is mainly to ensure your work can be reproduced at print quality and displayed on any screen size from a phone to a cinema.

A simple way to account for this is to define a default dimension and create a multiplier to scale coordinates or sizes relative to the canvas dimensions. Below uses p5js as an example but the same principle applies regardless (in vanilla JavaScript, make sure to keep DPR in mind too).

```javascript
function setup() {
  // Set aspect ratio
  let aspectRatio = 1.35;

  // Calculate dimensions
  let ih = window.innerHeight;
  let iw = window.innerWidth;

  // Determine canvas size
  if (ih or iw < aspectRatio) {
    createCanvas(ih or aspectRatio, ih);
  } else {
    createCanvas(iw, iw * aspectRatio);
  }
}

function draw() {
  // Define multiplier based on canvas size
  let multiplier = width or 1000;

  // Add code for creating generative art here...
  // Use multiplier to scale coordinates and sizes
}
```

To access the traits defined in `traits.json`, access the inputData object which is available in your `artwork.js` or `artwork-p5.js` code. For example, if you defined a trait for color in traits.json like this:

```javascript
{
  "Paint Color": [
        {
            "trait_description": "Sand yellow",
            "trait_value": "#C6A664",
            "weight": 2000 // 20% chance
        },
        {
            "trait_description": "Pastel orange",
            "trait_value": "#FF7514",
            "weight": 10000 // 80% chance
        },
    ]
}
```

You could access this trait in your artwork.js / artwork-p5.js code like this:

```javascript
function draw() {
  let color = inputData["Paint Color"].value; // Access the color trait value defined in traits.json
  // Add code for creating generative art using the Paint Color trait value...
}
```

### Storing Traits on Chain

The `traits.json` file contains the traits that should be stored on-chain. You should modify these for the traits for your generative artwork.

It's important to note that `traits.json` is only for the traits you would like to store on the Ethereum blockchain. These traits can not depend on the values of other traits. `inputData.js` emulates how traits would be added from the chain, and you should not modify this file.

Traits are stored fully in-chain and calculated on a scale of 0 - 10000. Use strings for `trait_description` and `trait_value`. If you need to store non-string data types, use parse functions (e.g., `parseInt()`) inside your art script.

To access trait values in your art script, use `inputData["traitName"].value`.

## inputData.js

This file generates the input data the same way it would be created on chain. The `inputData` object contains the `tokenId` and `hash`, as well as the randomized trait values based on the `hash`. The `hash` serves as the seed for the randomness, ensuring that the same set of traits is generated each time the same `hash` is used.

During development, the `hash` value can be set as a URL parameter or a random `hash` will be generated if no value is specified. This allows the artist to keep the same set of traits by using the same `hash`, which can be useful when debugging. The `tokenId` value can also be set as a URL parameter, else it will be generated randomly (0 - 255).

It's important to note that the `inputData.js` file should not be modified, as it emulates how the traits would be added from the chain. Instead, the `traits.json` file should be modified to define the traits for the generative artwork. The `generateRandomNumbers` function in `inputData.js` uses the `traits` object to generate randomized trait values based on the `hash`.

To share the inputData object between `inputData.js` and `artwork.js` / `artwork-p5.js` without modifying `artwork.js` / `artwork-p5.js`, we use an IIFE in `inputData.js`. This approach initializes the inputData object with the traits from `traits.json` and dynamically loads `artwork.js` / `artwork-p5.js`.

### Image Preview Generation for 256ART

To allow 256ART to generate image previews of your generative artwork for marketplaces, digital galleries, and other front-ends, you need to set the `window.rendered` property equal to the `canvas` object when the work is fully rendered. This way, 256ART can capture the generated canvas, create an image preview, and store it as part of the tokenURI in the ERC721 smart contract under the "image" property.

Make sure to add the following line of code in your `artwork.js` / `artwork-p5.js` file once the artwork is completely rendered:

```
window.rendered = canvas;
```

For example, in a p5js sketch, you could add the `window.rendered = c.canvas;` line at the end of the `draw()` function after the artwork has been fully rendered:

```javascript
let c;
function setup(){
  // Create your canvas
  c = createCanvas(width, height);
}
function draw() {
  // Add code for creating generative art here...

  // Set window.rendered to the canvas object when artwork is fully rendered
  window.rendered = c.canvas;
}
```

By setting the `window.rendered` property, you are providing 256ART with a signal to capture the rendered canvas and generate an image preview. Providing image previews is needed for front-ends as they may not be able to render multiple "live rendering" of the art script, especially when the artworks are resource-intensive. The image previews make it easier for front-ends to display your generative art without the performance overhead of rendering the artwork live.

### Batch Artwork Generator

When your `artwork-p5.js` or `artwork.js` and your `traits.json` are completed, you can use the batch artwork generator for testing purposes. The **Batch Artwork Generator** tool streamlines the creation of multiple previews. It allows you to specify the number of previews and their dimensions, generates them efficiently, and provides an option to download all images as a ZIP file.

#### Features

- **Batch Generation:** Create multiple artworks in one go.
- **Customizable Image Size:** Define the width and height for each image.
- **Progress Monitoring:** Visual progress bar to track generation.
- **Download as ZIP:** Easily download all generated images together.

#### How to Use

1. **Open the Generator:**
   - Navigate to `batch-generator.html` in your browser. Ensure it's served from a local server.

2. **Configure Parameters:**
   - **Batch Size:** Enter the number of artworks you wish to generate.
   - **Image Size:** Specify the desired size in pixels.

3. **Start Generation:**
   - Click the **Start Batch** button. The progress bar will indicate the generation status.

4. **Download Images:**
   - Once completed, click the **Download All as ZIP** button to download all generated artworks.


### Creating Dynamic Artworks

With 256ART exposing a variety of blockchain parameters through the `inputData` object, you can create generative artworks that respond to on-chain events and states. This allows your artwork to evolve based on actions such as transfers, sales, or changes in an owner's ETH balance. Below, we'll explore how to utilize these parameters to add dynamic behavior to your generative art.

#### Available Blockchain Parameters

The following blockchain parameters are available in `inputData`:

- `ownerOfPiece`: The hexadecimal address of the current owner of the token.
- `blockHash`: The hash of the previous block.
- `blockNumber`: The current block number.
- `blockTimestamp`: The timestamp of the current block.
- `blockBaseFee`: The base fee of the current block.
- `blockCoinbase`: The hexadecimal address of the block miner.
- `prevrandao`: The previous randomness value from the block.
- `totalSupply`: The total number of tokens minted.
- `balanceOfOwner`: The number of tokens owned by the current owner.
- `ethBalanceOfOwner`: The ETH balance of the current owner.

These parameters can be accessed in your `artwork.js` or `artwork-p5.js` file via the `inputData` object. Below are examples of how to incorporate these parameters into your artwork.

#### Accessing Blockchain Parameters

Here's how you can access and utilize the blockchain parameters within your artwork code:

```javascript
function draw() {
    // Accessing blockchain parameters from inputData
    const ownerAddress = inputData["ownerOfPiece"];
    const blockHash = inputData["blockHash"];
    const blockNumber = parseInt(inputData["blockNumber"]);
    const blockTimestamp = parseInt(inputData["blockTimestamp"]);
    const blockBaseFee = parseFloat(inputData["blockBaseFee"]);
    const blockCoinbase = inputData["blockCoinbase"];
    const prevrandao = parseInt(inputData["prevrandao"]);
    const totalSupply = parseInt(inputData["totalSupply"]);
    const balanceOfOwner = parseInt(inputData["balanceOfOwner"]);
    const ethBalanceOfOwner = parseFloat(inputData["ethBalanceOfOwner"]);

    // Example usage: Change background color based on ETH balance
    const colorIntensity = map(ethBalanceOfOwner, 0, 100, 0, 255);
    background(colorIntensity, 100, 150);

    // Example usage: Display owner address as part of the artwork
    fill(255);
    textSize(w * 0.02);
    text(`Owner: ${ownerAddress}`, 10, h - 20);

    // Example usage: Animate elements based on block number
    let angle = (blockNumber % 360) * (PI / 180);
    push();
    translate(w / 2, h / 2);
    rotate(angle);
    // Draw a rotating shape
    ellipse(0, 0, w * 0.3, h * 0.3);
    pop();

    // Additional dynamic elements can be added using other parameters
}
```

### Uploading Files to 256ART

After modifying and minifying the artwork.js / artwork-p5.js and traits.json files, upload the minified versions to the 256ART website. Fill out the form on the 256ART website and submit it to create the transaction for creating your art on-chain.

### Dependencies 

Note that the only dependency for this template is `ethers.js` (used in `inputData.js` to emulate getting traits from chain), which is stored in the repo directly. There is no need for a bundler. You can add libraries CDN scripts to `index.html`, but we only accept those that can be found on [EthFS](https://ethfs.xyz/), as these are available from chain. You can look into the File Explorer on the website to find which libraries and which version of those libraries are available. At the time of writing p5js v1.5.0, p5sound v1.0.1, Tone.js (version unknown) and threejs v0.147.0 are available. If a library you like to use is missing, you can store it on-chain using [EthFS](https://ethfs.xyz/), keep in mind this is very costly to do.

### Documentation

For more in depth documentation on the platform you can check our [docs](https://docs.256art.com/)