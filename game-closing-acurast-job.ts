function generateRngArray() {
  const hexString =
    _STD_.random.generateSecureRandomHex() +
    _STD_.random.generateSecureRandomHex();
  const a = [];

  for (let i = 0; i < 12; i += 2) {
    const byteHex = hexString.substring(i, i + 2);
    const byteNumber = parseInt(byteHex, 16);
    a.push(byteNumber);
  }
  return a;
}

function decodeDynamicUint8Array(hexString) {
  // Remove '0x' prefix if present
  hexString = hexString.startsWith("0x") ? hexString.substring(2) : hexString;

  // The length of the array is represented by the first 64 hex characters
  const arrayLengthHex = hexString.substring(64, 128);
  const arrayLength = parseInt(arrayLengthHex, 16);

  const elements = [];
  // Each uint8 element is 2 hex characters, but occupies a 64-character slot in the ABI encoding
  for (let i = 0; i < arrayLength; i++) {
    // Calculate the start index of the 64-character segment for each element
    // The first element starts after the 64 characters reserved for the length (i.e., at index 64)
    const elementStartIndex = 128 + i * 64;
    // The significant part of a uint8 element is the last 2 characters of the 64-character segment
    const elementHex = hexString.substring(
      elementStartIndex + 60,
      elementStartIndex + 64
    );
    const element = parseInt(elementHex, 16);
    elements.push(element);
  }

  return elements;
}

function encodeDynamicUint8Array(data) {
  let encoded =
    "0x0000000000000000000000000000000000000000000000000000000000000020"; // Offset
  encoded += data.length.toString(16).padStart(64, "0");
  data.forEach((rngArray) => {
    rngArray.forEach((rng) => {
      encoded += rng.toString(16).padStart(2, "0");
    });
  });
  return encoded;
}

function retriveRngRequestAndFullfill(rpc, contract) {
  fetch(rpc, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "getblock.io",
      method: "eth_call",
      params: [
        {
          data: "0xe23dc81b",
          to: contract,
        },
        "latest",
      ],
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("response", data);
      if (!data) return;
      const rngRequests = decodeDynamicUint8Array(data.result);
      const rngs = [];
      rngRequests.forEach((rngRequest) => {
        rngs.push(generateRngArray());
      });

      const payload = encodeDynamicUint8Array(rngs);
      _STD_.chains.ethereum.fulfill(
        rpc,
        contract,
        payload, // Payload
        // Transaction parameters
        {
          methodSignature: "fullfillRngs(uint8[6][])",
          gasLimit: "9000000",
          maxFeePerGas: "25500000000",
          maxPriorityFeePerGas: "2550000000",
        },
        // Success callback
        (opHash) => {},
        // Error callback
        (err) => {}
      );
    })
    .catch((errorMessage) => {
      console.log("error", errorMessage);
    });
}

// Fantom Testnet
retriveRngRequestAndFullfill(
  "https://go.getblock.io/65f05825ad964b249114bf9feb11f62f",
  "0x87e391f1A399b598bA8D8Da820D8606045056a97"
);
