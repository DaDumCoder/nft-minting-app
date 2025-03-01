import { Web3 } from "web3"; // Updated to named import for Web3 4.x
import { Web3EthContract } from "web3-eth-contract"; // Named import for Web3 4.x
import { fetchData } from "../data/dataActions";

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    try {
      const abiResponse = await fetch("/config/abi.json", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const abi = await abiResponse.json();
      const configResponse = await fetch("/config/config.json", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const CONFIG = await configResponse.json();
      const { ethereum } = window;
      const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
      if (metamaskIsInstalled) {
        // No need to setProvider manually with Web3 4.x
        const web3 = new Web3(ethereum); // Web3 4.x accepts provider directly
        await ethereum.request({ method: "eth_requestAccounts" }); // Ensure accounts are requested
        const accounts = await web3.eth.getAccounts(); // Use getAccounts method
        const networkId = await web3.eth.getChainId(); // Use getChainId for Web3 4.x
        if (networkId === CONFIG.NETWORK.ID) {
          const smartContract = new Web3EthContract(abi, CONFIG.CONTRACT_ADDRESS); // Simplified
          dispatch(
            connectSuccess({
              account: accounts[0],
              smartContract: smartContract,
              web3: web3,
            })
          );
          // Add listeners
          ethereum.on("accountsChanged", (accounts) => {
            dispatch(updateAccount(accounts[0]));
          });
          ethereum.on("chainChanged", () => {
            window.location.reload();
          });
        } else {
          dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
        }
      } else {
        dispatch(connectFailed("Install Metamask."));
      }
    } catch (err) {
      dispatch(connectFailed("Something went wrong: " + err.message));
    }
  };
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};
