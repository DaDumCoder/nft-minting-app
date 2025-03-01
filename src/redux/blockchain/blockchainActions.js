import { Web3 } from "web3"; // Web3 4.x
import { Contract } from "web3-eth-contract"; // Web3 4.x
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
        const web3 = new Web3(ethereum);
        await ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.getChainId();
        console.log("Detected Network ID:", networkId, "Expected:", CONFIG.NETWORK.ID); // Debug log
        if (networkId === Number(CONFIG.NETWORK.ID)) { // Ensure CONFIG.NETWORK.ID is a number
          const smartContract = new Contract(abi, CONFIG.CONTRACT_ADDRESS);
          console.log("Smart Contract Initialized:", smartContract); // Debug log
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
      } else {
        dispatch(connectFailed("Install Metamask."));
      }
    } catch (err) {
      console.error("Connection Error:", err); // Debug log
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
