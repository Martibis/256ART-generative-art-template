## 256ART Generative Art Template

This is a template for creating generative art to be released on-chain via 256ART 

### Getting Started

To get started with this template, follow these steps:

1. Clone or download the repository.
2. Open the `artwork.js` file and modify the code to create your desired generative art.
3. Open the `traits.js` file and modify the code to define the traits that should be stored on-chain.
4. Access the traits defined in `traits.js` from `artwork.js` using the `inputData` object.
5. Minify the `artwork.js` and `traits.js` files using a tool such as [MinifyAll](https://marketplace.visualstudio.com/items?itemName=Luub.minifyall) in Visual Studio Code.
6. Upload the minified `artwork.min.js` and `traits.min.js` files to the 256ART website.
7. Fill out the form on the website and submit it to create the transactions for creating the art on-chain.

### File Structure

- `artwork.js`: This file contains the code for generating the generative art. This is the file that You should modify.
- `artwork.min.js`: This is the minified version of `artwork.js`. This is the file that should be uploaded to the 256ART website.
- `traits.js`: This file contains the code that defines the traits that should be stored on-chain.
- `traits.min.js`: This is the minified version of `traits.js`. This is the file that should be uploaded to the 256ART website.
- `inputData.js`: This file emulates how traits would be added from the chain. You should not modify this file.
- `index.html`: This file contains the code for displaying the generative art on the website. You can add libraries CDN scripts to this file, but only those that can be found on EthFS.

### Creating the Generative Art

The `artwork.js` file contains the code for generating the generative art. You should modify this code to create your desired generative art.

The output must be dimension agnostic, meaning it scales seamlessly to any dimension. While you can control the dimension ratio (e.g. width/height can be 1.0, 1.5, 0.75 etc.) you have no control over the dimensions of the browser someone else might be using. At lower resolutions, fewer pixels may limit what your output looks like, such as the smoothness of lines, which is okay. This is mainly to ensure your work can be reproduced at print quality and displayed on any screen size from a phone to a cinema.

A simple way to account for this is to define a default dimension and create a multiplier to scale coordinates or sizes relative to the canvas dimensions. Below uses p5js as an example but the same principle applies regardless of the language.

```javascript
function setup() {
  // Set aspect ratio
  let aspectRatio = 1.35;

  // Calculate dimensions
  let ih = window.innerHeight;
  let iw = window.innerWidth;

  // Determine canvas size
  let canvasSize;
  if (ih / iw < aspectRatio) {
    canvasSize = ih / aspectRatio;
  } else {
    canvasSize = iw;
  }

  // Create canvas
  createCanvas(canvasSize, canvasSize);
}

function draw() {
  // Define multiplier based on canvas size
  let multiplier = width / 2400;

  // Use multiplier to scale coordinates and sizes
  // Add code for creating generative art here...
}
```

To access the traits defined in `traits.js`, access the inputData object which is available in your `artwork.js` code. For example, if you defined a trait for color in traits.js like this:

```
{
  "color": [
    { "trait_value": "red", "weight": 5000 },
    { "trait_value": "blue", "weight": 10000 }
  ]
}
```

You could access this trait in your artwork.js code like this:

```
function draw() {
  let color = inputData.color; // Access the color trait defined in traits.js
  // Add code for creating generative art using the color trait...
}
```

### Storing Traits on Chain

The `traits.js` file contains the traits that should be stored on-chain. You should modify these for the traits for your generative artwork.

It's important to note that `traits.js` is only for the traits the generative artist would like to store on the Ethereum blockchain. `inputData.js` emulates how traits would be added from the chain, and you should not modify this file.

Traits are stored fully in-chain and calculated on a scale of 0 - 10000. Use strings for `trait_description` and `trait_value` (for on-chain storage). If you need to store non-string data types, use parse functions (e.g., `parseInt()`) in `artwork.js`.

To access traits in your art script, use `inputData["traitName"]`.

## inputData.js

This file generates the input data the same way it would be created on-chain. The `inputData` object contains the `tokenId` and `hash`, as well as the randomized trait values based on the `hash`. The `hash` serves as the seed for the randomness, ensuring that the same set of traits is generated each time the same `hash` is used.

The `hash` value can be set as a URL parameter or a random `hash` will be generated if no value is specified. This allows the artist to keep the same set of traits by using the same `hash`, which can be useful during development. The `tokenId` value can also be set as a URL parameter or generated randomly.

It's important to note that the `inputData.js` file should not be modified, as it emulates how the traits would be added from the chain. Instead, the `traits.js` file should be modified to define the traits for the generative artwork. The `generateRandomNumbers` function in `inputData.js` uses the `traits` object to generate randomized trait values based on the `hash`.

### Uploading Files to 256ART

After modifying and minifying the artwork.js and traits.js files, upload the minified versions to the 256ART website. Fill out the form on the 256ART website and submit it to create the transaction for creating your art on-chain.

### Dependencies 

Note that the only dependency for this template is `ethers.js` (used in `inputData.js` to emulate getting traits from chain), which is stored in the repo directly. There is no need for a bundler. You can add libraries CDN scripts to `index.html`, but we only accept those that can be found on [EthFS](https://ethfs.xyz/).
