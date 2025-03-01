import { Web3 } from "web3";
import { Contract } from "web3-eth-contract"; // Ensure correct import
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
      if (!ethereum) {
        dispatch(connectFailed("MetaMask is not installed or not detected."));
        return;
      }
      const metamaskIsInstalled = ethereum.isMetaMask;
      if (metamaskIsInstalled) {
        const web3 = new Web3(ethereum);
        try {
          const accounts = await ethereum.request({ method: "eth_requestAccounts" });
          const networkId = await web3.eth.getChainId();
          console.log("Detected Network ID (type:", typeof networkId, "):", networkId);
          console.log("Expected Network ID (type:", typeof CONFIG.NETWORK.ID, "):", CONFIG.NETWORK.ID);
          if (Number(networkId) === Number(CONFIG.NETWORK.ID)) {
            const smartContract = new Contract(abi, CONFIG.CONTRACT_ADDRESS, {
              from: accounts[0],
              gas: 2000000,
            });
            smartContract.setProvider(ethereum); // Ensure provider is set
            if (!smartContract.options.address) {
              throw new Error("Contract address not set correctly.");
            }
            dispatch(
              connectSuccess({
                account: accounts[0],
                smartContract: smartContract,
                web3: web3,
              })
            );
            ethereum.on("accountsChanged", (accounts) => {
              dispatch(updateAccount(accounts[0]));
            });
            ethereum.on("chainChanged", () => {
              window.location.reload();
            });
          } else {
            dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}. Network ID mismatch: ${networkId} != ${CONFIG.NETWORK.ID}`));
          }
        } catch (err) {
          console.error("MetaMask Request Error:", err);
          if (err.code === 4001) {
            dispatch(connectFailed("User rejected the request."));
          } else {
            dispatch(connectFailed("Failed to connect to MetaMask: " + err.message));
          }
        }
      } else {
        dispatch(connectFailed("Please use MetaMask as your wallet."));
      }
    } catch (err) {
      console.error("Connection Error:", err);
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
