import { createWalletClient, custom, createPublicClient, defineChain, parseEther ,formatEther} from "https://esm.sh/viem"
import { sepolia } from 'https://esm.sh/viem/chains';

import { contractAddress,  CoffeeAbi } from "./constants-js.js"

const connectButton = document.getElementById('connectWallet');
const buyButton = document.getElementById('buyCoffee');
const checkButton = document.getElementById('checkBalance');
const coffeeActions = document.getElementById('coffeeActions');
const ethAmountInput = document.getElementById('ethAmount');
let WalletClient;
let PubLicClient;

async function connect() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask is installed!');
            WalletClient = createWalletClient({
                transport: custom(window.ethereum),
            })
            const addresses = await WalletClient.requestAddresses();
            const userAddress = addresses[0];

            // Update UI
            connectButton.innerHTML = 'Connected!';
            connectButton.style.display = 'none';
            coffeeActions.style.display = 'block';
        } else {
            connectButton.innerHTML = 'Please install MetaMask!';
        }
    } catch (error) {
        console.error('Connection error:', error);
        connectButton.innerHTML = 'Connection Failed';
    }
}

async function buyCoffee() {
    const ethAmount = ethAmountInput.value
    console.log(`Funding with ${ethAmount}...`)
  
    if (typeof window.ethereum !== "undefined") {
      try {
        WalletClient= createWalletClient({
          transport: custom(window.ethereum),
        })
        const [account] = await WalletClient.requestAddresses()
        const currentChain = await getCurrentChain(WalletClient)
  
        console.log("Processing transaction...")
        PubLicClient = createPublicClient({
          transport: custom(window.ethereum),
        })
        const { request } = await PubLicClient.simulateContract({
          address: contractAddress,
          abi: CoffeeAbi,
          functionName: "fund",
          account,
          chain: currentChain,
          value: parseEther(ethAmount),
        })
        const hash = await WalletClient.writeContract(request)
        console.log("Transaction processed: ", hash)
      } catch (error) {
        console.log(error)
      }
    } else {
      fundButton.innerHTML = "Please install MetaMask"
    }
  
}


async function getCurrentChain(client) {
    // Get the chain ID from the connected wallet client
    const chainId = await client.getChainId();
  
    // Define the chain parameters using viem's defineChain
    // const currentChain = defineChain({
    //   id: chainId,
    //   name: "Local Devnet", // Provide a descriptive name (e.g., Anvil, Hardhat)
    //   nativeCurrency: {
    //     name: "Ether",
    //     symbol: "ETH",
    //     decimals: 18,
    //   },
    //   rpcUrls: {
    //     // Use the RPC URL of your local node
    //     default: { http: ["http://localhost:8545"] },
    //     // public: { http: ["http://localhost:8545"] }, // Optional: specify public RPC if different
    //   },
    //   // Add other chain-specific details if needed (e.g., blockExplorers)
    // });

    const currentChain = sepolia; 
    
    return currentChain;
  }
async function checkBalance() {
 if (typeof window.ethereum !== "undefined") {
        PubLicClient= createPublicClient({
          transport: custom(window.ethereum),
        })
        const balance=await PubLicClient.getBalance({
            address:contractAddress,

        });
        console.log(formatEther(balance));
 }
}


connectButton.onclick = connect
buyButton.onclick = buyCoffee
checkButton.onclick = checkBalance

