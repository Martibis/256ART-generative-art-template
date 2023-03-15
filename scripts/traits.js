// Traits stored fully in-chain; consider on-chain storage cost
// Traits calculated on a scale of 0 - 10000
// Use strings for trait_description and trait_value (for on-chain storage)
// Use parse functions for non-string data types (e.g., parseInt())
// Access traits in your art script with inputData["traitName"]

let traits = {
    "Amount Of Lines": [
        { trait_description: "One line", trait_value: "1", weight: 5000 }, // 50% chance (0 - 5000)
        { trait_description: "Two lines", trait_value: "2", weight: 8500 }, // 35% chance (5000 - 8000)
        { trait_description: "Three lines", trait_value: "3", weight: 10000 } // 15% chance (8000 - 10000)
    ],
    "Paint Color": [
        { trait_description: "Sand yellow", trait_value: "#C6A664", weight: 1000 }, // 10% chance (0 - 1000)
        { trait_description: "Pastel orange", trait_value: "#FF7514", weight: 2000 }, // 10% chance (1000 - 2000)
        { trait_description: "Flame red", trait_value: "#AF2B1E", weight: 3000 }, // 10% chance (2000 - 3000)
        { trait_description: "Moss green", trait_value: "#2F4538", weight: 4000 }, // 10% chance (3000 - 4000)
        { trait_description: "Terra brown", trait_value: "#4E3B31", weight: 5000 }, // 10% chance (4000 - 5000)
        { trait_description: "Tarpaulin grey", trait_value: "#4C514A", weight: 6000 }, // 10% chance (5000 - 6000)
        { trait_description: "Green beige", trait_value: "#BEBD7F", weight: 7000 }, // 10% chance (6000 - 7000)
        { trait_description: "Ochre brown", trait_value: "#955F20", weight: 8000 }, // 10% chance (7000 - 8000)
        { trait_description: "Black grey", trait_value: "#23282B", weight: 9000 }, // 10% chance (8000 - 9000)
        { trait_description: "Graphite grey", trait_value: "#474A51", weight: 10000 } // 10% chance (9000 - 10000)
    ]
};
