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
let blockTimestamp = search.get('blockTimestamp') || Math.floor(Date.now() / 1000);
let blockBaseFee = search.get('blockBaseFee') || Math.floor(Math.random() * 1e9); // Example: up to 1 Gwei
let blockCoinbase = search.get('blockCoinbase') || genRandomAddress();
let ethBalanceOfOwner = search.get('ethBalanceOfOwner') || Math.floor(Math.random() * 1e18); // Up to 1 ETH

// Main input data
let inputData = {
    'tokenId': tokenId,
    'hash': hash,
    'ownerOfPiece': ownerOfPiece,
    'blockHash': blockHash,
    'blockNumber': blockNumber,
    'prevrandao': prevrandao,
    'totalSupply': totalSupply,
    'balanceOfOwner': balanceOfOwner,

    // Including the new fields
    'blockTimestamp': blockTimestamp,
    'blockBaseFee': blockBaseFee,
    'blockCoinbase': blockCoinbase,
    'ethBalanceOfOwner': ethBalanceOfOwner
};

/**
 * Function to display error messages on the screen.
 * Creates an error container if it doesn't exist and appends the message.
 * @param {string} message - The error message to display.
 */
/**
 * Function to display error messages on the screen.
 * Creates an error container if it doesn't exist and appends the message along with helpful tips.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    let errorDiv = document.getElementById('error-container');
    let errorMsg;
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-container';
        // Styling the error container for visibility
        errorDiv.style.display = 'flex';
        errorDiv.style.alignItems = 'center';
        errorDiv.style.justifyContent = 'center';
        errorDiv.style.top = '0';
        errorDiv.style.left = '0';
        errorDiv.style.width = '100%';
        errorDiv.style.height = '100%';
        errorDiv.style.color = 'white';
        errorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Added background for better readability
        errorDiv.style.padding = '20px';
        errorDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        errorDiv.style.zIndex = '1000';
        errorDiv.style.fontFamily = 'Arial, sans-serif';
        errorDiv.style.fontSize = '16px';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.flexDirection = 'column'; // Allow multiple lines

        errorMsg = document.createElement('p');
        errorMsg.style.marginBottom = '10px';
        errorDiv.appendChild(errorMsg);

        const tipMsg = document.createElement('p');
        tipMsg.style.fontStyle = 'italic';
        tipMsg.style.fontSize = '14px';
        tipMsg.innerText = "Consider using parseInt(), parseFloat(), or comparing to 'true' for boolean values in your script.";
        errorDiv.appendChild(tipMsg);

        document.body.appendChild(errorDiv);
    } else {
        errorMsg = errorDiv.querySelector('p');
    }
    errorMsg.innerText = message;
}


(async function () {
    try {
        // Fetch traits data from the local JSON file
        const response = await fetch('../scripts/traits.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch traits.json: ${response.status} ${response.statusText}`);
        }
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
        const traitKeys = Object.keys(traits);
        for (let j = 0; j < traitKeys.length; j++) {
            let r = randNumbers[j];
            let traitArray = traits[traitKeys[j]];
            let traitAssigned = false;

            for (let k = 0; k < traitArray.length; k++) {
                if (r < traitArray[k].weight) {
                    const traitValue = traitArray[k].trait_value;
                    const traitDescription = traitArray[k].trait_description;

                    // Type checks for trait_value and trait_description
                    if (typeof traitValue !== 'string') {
                        throw new TypeError(`trait_value for trait "${traitKeys[j]}" must be a string (required for on-chain storage). Received type: ${typeof traitValue}`);
                    }

                    if (typeof traitDescription !== 'string') {
                        throw new TypeError(`trait_description for trait "${traitKeys[j]}" must be a string (required for on-chain storage). Received type: ${typeof traitDescription}`);
                    }

                    inputData[traitKeys[j]] = { "value": traitValue, "description": traitDescription };
                    traitAssigned = true;
                    break;
                }
            }

            // Optionally, handle case where no trait was assigned
            if (!traitAssigned) {
                throw new Error(`No valid trait found for trait category "${traitKeys[j]}" with random number ${r}.`);
            }
        }

        // Log inputData for easier debugging
        console.log(inputData);

        // Load artwork.js after inputData.js has finished executing
        const artworkScript = document.createElement('script');
        artworkScript.src = window.p5 ? '../scripts/artwork-p5.js' : '../scripts/artwork.js';
        document.body.appendChild(artworkScript);
    } catch (error) {
        console.error("Error processing traits data:", error);
        // Display the error on the screen
        displayError(`Error: ${error.message}`);
        // Optionally, you can prevent further script execution or provide fallback behavior here
    }
})();
