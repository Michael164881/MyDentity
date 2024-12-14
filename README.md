# MyDentity : Malaysian Digital Identity Management Using Blockchain Technology

MyDentity demonstrates the ability of blockchain technology to be used as a identity management system in which could 

## 1) Preliminary Steps:
Install the following prerequisite before running the project:
1. Download Ganache 
2. Node.js
3. Metamask
4. Install react.js for client and hardhat for smart contract:
```bash
# Install Hardhat dependencies
npm install

# Install client dependencies
cd client
npm install
```

## 2) Setup Process:
This step only required to be done once.
1. Open Ganache
2. Create a new workspace (MyDentity)
4. Save the workspace
5. Install MetaMask browser extension
6. Add Ganache network to MetaMask:
   - Click network dropdown → Add network → Add network manually
   - Network Name: Ganache
   - New RPC URL: http://127.0.0.1:7545
   - Chain ID: 1337
   - Currency Symbol: ETH
7. Import Ganache account to MetaMask:
   - Copy private key from Ganache
   - In MetaMask: Click account icon → Import account → Paste private key

## 3) Deploying Smart Contract:
This step only required to be done once.
1. Run the following command to deploy the smart contract:
```bash
# In the root directory
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```
2. Copy the following contract address and paste it into the client/src/contracts/contract.js file.
```json
{
  "address": "YOUR_DEPLOYED_CONTRACT_ADDRESS"
}
```
3. Copy the following contract files "Mydentity.dbg.json" and "Mydentity.json" from artifacts/contracts and paste it into the client/src/contracts folder.

## 4) Running the Client:
Whenever you want to run the client (to deploy localhost), run the following command:
1. Run the following command to start the client:
```bash
cd client
npm start
```
Ensure change directory to client before running the command "npm start".
The client should automatically run a browser based on the following url: `http://localhost:5173`


### Issues and Problems:
1. Client is not loading.
    - May relate to local network at ganache not running.
    - May relate to the contract address not being pasted correctly.
2. Transaction error.
    - May relate to metamask not being installed.
    - May relate to the network not being connected to ganache.
    - May relate to the account not being imported to metamask.
    - May relate to the account not having enough balance.


