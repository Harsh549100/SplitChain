# 💸 SplitChain – Onchain Expense Splitter

**SplitChain** is a decentralized group expense splitter built on the Ethereum blockchain. It enables friends, roommates, or colleagues to track shared expenses and settle group balances securely using smart contracts and MetaMask. It offers an intuitive, secure, and fully on-chain experience with local transaction history.

---

## 🚀 Features

- ✅ **Ethereum-based smart contract** for real-time, transparent settlements  
- 👥 **Group creation and member management**  
- 💰 **Track shared expenses**, contributions, and balances  
- 🔐 **Connect wallet via MetaMask** and interact using Ethers.js  
- 📊 **Transaction history stored locally** (using `localStorage`)  
- 🌐 **ENS name support** for simplified addresses  
- 🎨 **Animated, responsive UI** using Tailwind CSS  
- 🧠 **First-visit onboarding** shows core features & walkthrough  
- ⚡ **One-click USDC (ERC-20) payment settlement**  
- 🔒 100% on-chain logic with no centralized backend  

---

## 🛠 Tech Stack

| Layer                 | Technology                                      |
|-----------------------|-------------------------------------------------|
| **Frontend**          | HTML, Tailwind CSS, TypeScript (Vanilla)       |
| **Styling**           | Tailwind CSS, Animations, Responsive Layout     |
| **Blockchain**        | Ethereum (Ethers.js integration)                |
| **Smart Contract**    | Solidity (deployed on Ethereum mainnet)         |
| **Wallet Integration**| MetaMask                                        |
| **ENS Resolution**    | Ethers.js ENS Support                           |
| **Data Storage**      | localStorage for transaction & group history    |
| **Bundler**           | Vite                                            |
| **Code Editor**       | Visual Studio Code (VS Code)                    |

---

## 📦 Smart Contract

- **Contract Address**: `0x6078398Fc308eD35569Ee6273B6aC88468CD31C7`  
- **ABI**:
```json
[
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

 Usage

- Connect your wallet (Metamask).
- Create a group and add participants by wallet addresses.
- Add expenses, and the smart contract will calculate and track shares.
- Users can pay their share directly using stablecoins.
- Check transaction history and analytics.

 Roadmap

- Multi-currency support (USDC, DAI).
- Enhanced security features.
- Improved gas optimization.

 Support

If you encounter any issues while using SplitChain, have questions, or want to suggest new features, feel free to reach out:

- Email: Shrivastavaharsh5491@gmail.com
- Connect with me on [LinkedIn](https://www.linkedin.com/in/harsh-shrivastava-40b240313/)

