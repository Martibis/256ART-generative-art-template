## 256ART Generative Art Template

This is a template for creating generative art to be released fully in-chain via 256ART 

### Getting Started

To get started with this template, follow these steps:

1. Clone or download the repository.
2. Open the `artwork.js` file and modify the code to create your generative artwork.
3. Open the `traits.json` file and modify the code to define the traits that should be stored on-chain.
4. Access the traits defined in `traits.json` from `artwork.js` using the `inputData` object.
5. Minify the `artwork.js` and `traits.json` files using a tool such as [MinifyAll](https://marketplace.visualstudio.com/items?itemName=Luub.minifyall) in Visual Studio Code.
6. Upload the minified `artwork.js` and `traits.json` files to the 256ART website.
7. Fill out the form on the website and submit it to create the transactions for creating the art on-chain.

### File Structure

- `artwork.js`: This file contains the code for generating the generative art. This is the file that you should modify. Make sure to minify it before uploading to 256ART.
- `traits.json`: This file contains the code that defines the traits that should be stored on-chain.
- `inputData.js`: This file emulates how traits would be added from the chain. You should not modify this file.
- `index.html`: This file contains the code for displaying the generative art on the website. You can add libraries CDN scripts to this file, but only those that can be found on EthFS.

### Creating the Generative Art

The `artwork.js` file contains the code for generating the generative art. You should modify this code to create your desired generative art.

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
  if (ih / iw < aspectRatio) {
    createCanvas(ih / aspectRatio, ih);
  } else {
    createCanvas(iw, iw * aspectRatio);
  }
}

function draw() {
  // Define multiplier based on canvas size
  let multiplier = width / 1000;

  // Add code for creating generative art here...
  // Use multiplier to scale coordinates and sizes
}
```

To access the traits defined in `traits.json`, access the inputData object which is available in your `artwork.js` code. For example, if you defined a trait for color in traits.json like this:

```
{
  "color": [
    { "trait_value": "red", "weight": 6000 }, //60% chance (0 - 6000)
    { "trait_value": "blue", "weight": 10000 } //40% chance (6000 - 10000)
  ]
}
```

You could access this trait in your artwork.js code like this:

```
function draw() {
  let color = inputData.color; // Access the color trait defined in traits.json
  // Add code for creating generative art using the color trait...
}
```

### Storing Traits on Chain

The `traits.json` file contains the traits that should be stored on-chain. You should modify these for the traits for your generative artwork.

It's important to note that `traits.json` is only for the traits you would like to store on the Ethereum blockchain. These traits can not depend on the values of other traits. `inputData.js` emulates how traits would be added from the chain, and you should not modify this file.

Traits are stored fully in-chain and calculated on a scale of 0 - 10000. Use strings for `trait_description` and `trait_value`. If you need to store non-string data types, use parse functions (e.g., `parseInt()`) inside your art script.

To access traits in your art script, use `inputData["traitName"]`.

## inputData.js

This file generates the input data the same way it would be created on chain. The `inputData` object contains the `tokenId` and `hash`, as well as the randomized trait values based on the `hash`. The `hash` serves as the seed for the randomness, ensuring that the same set of traits is generated each time the same `hash` is used.

During development, the `hash` value can be set as a URL parameter or a random `hash` will be generated if no value is specified. This allows the artist to keep the same set of traits by using the same `hash`, which can be useful when debugging. The `tokenId` value can also be set as a URL parameter, else it will be generated randomly (0 - 255).

It's important to note that the `inputData.js` file should not be modified, as it emulates how the traits would be added from the chain. Instead, the `traits.json` file should be modified to define the traits for the generative artwork. The `generateRandomNumbers` function in `inputData.js` uses the `traits` object to generate randomized trait values based on the `hash`.

To share the inputData object between `inputData.js` and `artwork.js` without modifying `artwork.js`, we use an IIFE in `inputData.js`. This approach initializes the inputData object with the traits from `traits.json` and dynamically loads `artwork.js`.

### Image Preview Generation for 256ART

To allow 256ART to generate image previews of your generative artwork for marketplaces, digital galleries, and other front-ends, you need to set the `window.rendered` property equal to the `canvas` object when the work is fully rendered. This way, 256ART can capture the generated canvas, create an image preview, and store it as part of the tokenURI in the ERC721 smart contract under the "image" property.

Make sure to add the following line of code in your `artwork.js` file once the artwork is completely rendered:

```
window.rendered = canvas;
```

For example, in a p5js sketch, you could add the `window.rendered = canvas;` line at the end of the `draw()` function after the artwork has been fully rendered:

```
function draw() {
  // Add code for creating generative art here...

  // Set window.rendered to the canvas object when artwork is fully rendered
  window.rendered = canvas;
}
```

By setting the `window.rendered` property, you are providing 256ART with a signal to capture the rendered canvas and generate an image preview. Providing image previews is needed for front-ends as they may not be able to render multiple "live rendering" of the art script, especially when the artworks are resource-intensive. The image previews make it easier for front-ends to display your generative art without the performance overhead of rendering the artwork live.

### Uploading Files to 256ART

After modifying and minifying the artwork.js and traits.json files, upload the minified versions to the 256ART website. Fill out the form on the 256ART website and submit it to create the transaction for creating your art on-chain.

### Dependencies 

Note that the only dependency for this template is `ethers.js` (used in `inputData.js` to emulate getting traits from chain), which is stored in the repo directly. There is no need for a bundler. You can add libraries CDN scripts to `index.html`, but we only accept those that can be found on [EthFS](https://ethfs.xyz/), as these are available from chain. You can look into the File Explorer on the website to find which libraries and which version of those libraries are available. At the time of writing p5js v1.5.0, p5sound v1.0.1, Tone.js (version unknown) and threejs v0.147.0 are available. If a library you like to use is missing, you can store it on-chain using [EthFS](https://ethfs.xyz/), keep in mind this is very costly to do.
