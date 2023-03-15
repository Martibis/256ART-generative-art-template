// Avoid modifying this file; live data comes from chain

// Add hash as URL parameter or generate random hash
let search = new URLSearchParams(window.location.search);
let genHash = (size) =>
    [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
let hash = search.get('hash') || "0x" + genHash(64);

// Add tokenId as URL parameter or generate random tokenId
let tokenId = search.get('tokenId') || Math.floor(Math.random() * 256);

// Main input data
let inputData = { 'tokenId': tokenId, 'hash': hash };

// Generate random numbers (as on chain)
function generateRandomNumbers(seed, timesToCall) {
    let randNumbers = [];
    for (let i = 0; i < timesToCall; i++) {
        let finalSeed = ethers.BigNumber.from(seed).add(i);
        let keccak = ethers.utils.keccak256(finalSeed._hex.toString());
        let r = ethers.BigNumber.from(keccak).mod(10000);
        randNumbers[i] = parseInt(r);
    }
    return randNumbers;
}
function hexToBytes(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}
let randNumbers = generateRandomNumbers(hash, Object.keys(traits).length);

// Add traits to inputData based on generated random numbers
for (let j = 0; j < Object.keys(traits).length; j++) {
    let r = randNumbers[j];
    for (let k = 0; k < Object.keys(traits)[j].length; k++) {
        if (r < traits[Object.keys(traits)[j]][k].weight) {
            inputData[Object.keys(traits)[j]] = traits[Object.keys(traits)[j]][k].trait_value;
            break;
        }
    }
}

// Log inputData for easier debugging
console.log(inputData);
