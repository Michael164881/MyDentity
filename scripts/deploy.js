// Import the Hardhat Runtime Environment
const hre = require("hardhat");

async function main() {

    // Deploy the contract
    const MyDentity = await hre.ethers.getContractFactory("MyDentity");
    const myDentity = await MyDentity.deploy();

    // Wait for the deployment to be mined
    await myDentity.deployed();

    console.log("MyDentity deployed to:", myDentity.address);
}

// Handle errors and execute the main function
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
