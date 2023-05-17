// Avoid modifying this file 
// It emulates data coming from chain and injects the artwork.js file

let search = new URLSearchParams(window.location.search);

let genHash = (size) =>
    [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
let hash = search.get('hash') || "0x" + genHash(64);

// Generate a random Ethereum address
let genRandomAddress = () =>
    "0x" + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

// Additional fields with default values
let ownerOfPiece = search.get('ownerOfPiece') || genRandomAddress();
let blockHash = search.get('blockHash') || "0x" + genHash(64);
let blockNumber = search.get('blockNumber') || Math.floor(Math.random() * 10000000);
let prevrandao = search.get('prevrandao') || Math.floor(Number.MAX_SAFE_INTEGER * Math.random());
let totalSupply = search.get('totalSupply') || Math.floor(Math.random() * 256);
let balanceOfOwner = search.get('balanceOfOwner') || Math.floor(Math.random() * totalSupply);
let tokenId = search.get('tokenId') || Math.floor(Math.random() * totalSupply);

// Main input data
let inputData = {
    'tokenId': tokenId,
    'hash': hash,
    'ownerOfPiece': ownerOfPiece,
    'blockHash': blockHash,
    'blockNumber': blockNumber,
    'prevrandao': prevrandao,
    'totalSupply': totalSupply,
    'balanceOfOwner': balanceOfOwner
};

(async function () {
    // Fetch traits data from the local JSON file
    const response = await fetch('../scripts/traits.json');
    const traitsData = await response.json();

    const traits = traitsData;

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

    // Load artwork.js after inputData.js has finished executing
    const artworkScript = document.createElement('script');
    artworkScript.src = '../scripts/artwork.js';
    document.body.appendChild(artworkScript);

    artworkScript.onload = function () {
        if (window.p5 && !window.p5.instance) {
            // The p5 library is loaded and there is no p5 instance yet, so create one.
            window.p5.instance = new p5();
        }
    };
})();

