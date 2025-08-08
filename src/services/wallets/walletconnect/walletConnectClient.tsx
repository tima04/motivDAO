import { WalletConnectContext } from "../../../contexts/WalletConnectContext";
import { useCallback, useContext, useEffect } from 'react';
import { WalletInterface } from "../walletInterface";
import {
  AccountId,
  ContractExecuteTransaction,
  ContractId,
  LedgerId,
  TokenAssociateTransaction,
  TokenId,
  Transaction,
  TransactionId,
  TransferTransaction,
  Client,
  TopicCreateTransaction,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
  TokenMintTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
  TopicMessage,
  PrivateKey,
  TopicId,
} from "@hashgraph/sdk";
import { ContractFunctionParameterBuilder } from "../contractFunctionParameterBuilder";
import { appConfig } from "../../../config";
import { SignClientTypes } from "@walletconnect/types";
import { DAppConnector, HederaJsonRpcMethod, HederaSessionEvent, HederaChainId, SignAndExecuteTransactionParams, transactionToBase64String } from "@hashgraph/hedera-wallet-connect";
import EventEmitter from "events";
import { Buffer } from 'buffer';


// Created refreshEvent because `dappConnector.walletConnectClient.on(eventName, syncWithWalletConnectContext)` would not call syncWithWalletConnectContext
// Reference usage from walletconnect implementation https://github.com/hashgraph/hedera-wallet-connect/blob/main/src/lib/dapp/index.ts#L120C1-L124C9
const refreshEvent = new EventEmitter();

// Create a new project in walletconnect cloud to generate a project id
const walletConnectProjectId = "377d75bb6f86a2ffd427d032ff6ea7d3";
const currentNetworkConfig = appConfig.networks.testnet;
const hederaNetwork = currentNetworkConfig.network;
const hederaClient = Client.forName(hederaNetwork);

// Adapted from walletconnect dapp example:
// https://github.com/hashgraph/hedera-wallet-connect/blob/main/src/examples/typescript/dapp/main.ts#L87C1-L101C4
const metadata: SignClientTypes.Metadata = {
  name: "Hedera CRA Template",
  description: "Hedera CRA Template",
  url: window.location.origin,
  icons: [window.location.origin + "/logo192.png"],
}
const dappConnector = new DAppConnector(
  metadata,
  LedgerId.fromString(hederaNetwork),
  walletConnectProjectId,
  Object.values(HederaJsonRpcMethod),
  [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
  [HederaChainId.Testnet],
);

// ensure walletconnect is initialized only once
let walletConnectInitPromise: Promise<void> | undefined = undefined;
const initializeWalletConnect = async () => {
  if (walletConnectInitPromise === undefined) {
    walletConnectInitPromise = dappConnector.init();
  }
  await walletConnectInitPromise;
};

export const openWalletConnectModal = async () => {
  await initializeWalletConnect();
  await dappConnector.openModal().then((x) => {
    refreshEvent.emit("sync");
  });
};

class WalletConnectWallet implements WalletInterface {
  private getSigner() {
    if (dappConnector.signers.length === 0) {
      throw new Error('No signers found!');
    }
    return dappConnector.signers[0];
  }

  private getAccountId() {
    // Need to convert from walletconnect's AccountId to hashgraph/sdk's AccountId because walletconnect's AccountId and hashgraph/sdk's AccountId are not the same!
    return AccountId.fromString(this.getSigner().getAccountId().toString());
  }

  async transferHBAR(toAddress: AccountId, amount: number) {
    const transferHBARTransaction = new TransferTransaction()
      .addHbarTransfer(this.getAccountId(), -amount)
      .addHbarTransfer(toAddress, amount);

    const signer = this.getSigner();
    await transferHBARTransaction.freezeWithSigner(signer);
    const txResult = await transferHBARTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  async createNFT(toAddress: AccountId) {
    const supplyKey = PrivateKey.generate();
    const accountId = this.getAccountId();
    const signer = this.getSigner();
    const nftCreate = await new TokenCreateTransaction()
      .setTokenName("Success!")
      .setTokenSymbol("Congrats!")
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(accountId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1)
      .setSupplyKey(supplyKey)
      .freezeWithSigner(signer);

    //Sign the transaction with the treasury key
    const nftCreateTxSign = await nftCreate.signWithSigner(signer);
    //Submit the transaction to a Hedera network
    const nftCreateSubmit = await nftCreateTxSign.executeWithSigner(signer);
    //Get the transaction receipt
    const nftCreateRx = await nftCreateSubmit.getReceiptWithSigner(signer);
    //Get the token ID
    const tokenId = nftCreateRx.tokenId;

    //Log the token ID
    console.log(`\nCreated NFT with Token ID: ` + tokenId);
    // Max transaction fee as a constant
    const maxTransactionFee = new Hbar(10);
    const CID = [
      new Uint8Array(
        Buffer.from(
        "ipfs://bafyreic463uarchq4mlufp7pvfkfut7zeqsqmn3b2x3jjxwcjqx6b5pk7q/metadata.json"
        )
      ),
    ];

    /*
    Pups meta data
  st_bd = {"name": "ST_BERNARD", "description": "An adorable ST_BERNARD pup!", "image": "https://ipfs.io/ipfs/QmUPjADFGEKmfohdTaNcWhp7VGk26h5jXDA7v3VtTnTLcW?filename=st-bernard.png", "attributes": [{"trait_type": "cuteness", "value": 100}]}
  shiba = {"name": "SHIBA_INU", "description": "An adorable SHIBA_INU pup!", "image": "https://ipfs.io/ipfs/QmYx6GsYAKnNzZ9A6NvEKV9nf1VaDzJrqDR23Y8YSkebLU?filename=shiba-inu.png", "attributes": [{"trait_type": "cuteness", "value": 100}]}
  pug = {"name": "PUG", "description": "An adorable PUG pup!", "image": "https://ipfs.io/ipfs/QmSsYRx3LpDAb1GZQm7zZ1AuHZjfbPkD6J7s9r41xu1mf8?filename=pug.png", "attributes": [{"trait_type": "cuteness", "value": 100}]}
    */

    const pug = {
      "name": "PUG", "description": "An adorable PUG pup!",
      //"image": "https://ipfs.io/ipfs/QmSsYRx3LpDAb1GZQm7zZ1AuHZjfbPkD6J7s9r41xu1mf8?filename=pug.png", 
      "attributes": [{ "trait_type": "cuteness", "value": 100 }]
    }

    const CID2 = [
      new Uint8Array(
        Buffer.from(JSON.stringify(pug)
        )
      ),
    ];

    let mintTx;
    if (tokenId) {
      mintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata(CID) //Batch minting - UP TO 10 NFTs in single tx
        .setMaxTransactionFee(maxTransactionFee)
        .freezeWithSigner(signer);
      // You may want to handle mintTx further here
    } else {
      throw new Error("Token ID is null. Failed to create NFT.");
    }

    //Sign the transaction with the supply key
    const mintTxSign = await (await mintTx).sign(supplyKey);

    //Submit the transaction to a Hedera network
    const mintTxSubmit = await mintTxSign.executeWithSigner(signer);

    //Get the transaction receipt
    const mintRx = await mintTxSubmit.getReceiptWithSigner(signer);
    //Log the serial number
    console.log(
      "Created NFT " + tokenId + " with serial number: " + mintRx.serials + "\n"
    );

    /*
    //Create the associate transaction and sign with Alice's key
    const associateAliceTx = await (await new TokenAssociateTransaction()
     .setAccountId(accountId)
     .setTokenIds([tokenId])
     .freezeWithSigner(signer)).signWithSigner(signer)

    //Submit the transaction to a Hedera network
    const associateAliceTxSubmit = await associateAliceTx.executeWithSigner(signer);

    //Get the transaction receipt
    const associateAliceRx = await associateAliceTxSubmit.getReceiptWithSigner(signer);

    //Confirm the transaction was successful
    console.log(
     `NFT association with Alice's account: ${associateAliceRx.status}\n`
    );
    */

    // Transfer the NFT from treasury to Alice
    // Sign with the treasury key to authorize the transfer
    const tokenTransferTx = await (await new TransferTransaction()
      .addNftTransfer(tokenId, 1, accountId, toAddress)
      .freezeWithSigner(signer)).signWithSigner(signer)

    const tokenTransferSubmit = await tokenTransferTx.executeWithSigner(signer)
    const tokenTransferRx = await tokenTransferSubmit.getReceiptWithSigner(signer)

    console.log(
      `\nNFT transfered: ${tokenTransferRx.status} \n`
    );
  }

  async createTopic(goal=""): Promise<string | null> {
    const signer = this.getSigner();
    const tx = new TopicCreateTransaction()
    .setTopicMemo("Commitment!")
    const frozenTx = await tx.freezeWithSigner(signer);
    const txResponse = await frozenTx.executeWithSigner(signer);
    const receipt = await txResponse.getReceiptWithSigner(signer);
    const topicId = receipt.topicId;
    console.log(`Your topic ID is: ${topicId}`);
    if (topicId !== undefined && topicId !== null) {
      let message2send = "I commit to achieve my goal! "
      if (goal!== "") {
        let message2send = `I make a commitment to: ${goal}`
      }
      let sendResponse = await (await new TopicMessageSubmitTransaction({
        topicId: topicId,
        message: message2send,
      })
      .freezeWithSigner(signer))
      .executeWithSigner(signer)
      // Get the receipt of the transaction
      //const getReceipt = await sendResponse.getReceiptWithSigner(signer);
      // Get the status of the transaction
       //const transactionStatus = getReceipt.status
       //console.log("The message transaction status " + transactionStatus.toString())
      return topicId.toString();
    }
    return null;
  }

  async sendMessage(topicId: string, message: string) {
    //TopicId.fromString(topicId),
    const signer = this.getSigner();
    let frozenTx = await new TopicMessageSubmitTransaction({
      topicId,
      message: message,
    }).freezeWithSigner(signer);
    let sendResponse = await frozenTx.executeWithSigner(signer);
    // Get the receipt of the transaction
    const getReceipt = await sendResponse
      .getReceiptWithSigner(signer)
    // Get the status of the transaction
    const transactionStatus = getReceipt.status
    console.log("The message transaction status " + transactionStatus.toString())
  }

  async transferFungibleToken(toAddress: AccountId, tokenId: TokenId, amount: number) {
    const transferTokenTransaction = new TransferTransaction()
      .addTokenTransfer(tokenId, this.getAccountId(), -amount)
      .addTokenTransfer(tokenId, toAddress.toString(), amount);

    const signer = this.getSigner();
    await transferTokenTransaction.freezeWithSigner(signer);
    const txResult = await transferTokenTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  async transferNonFungibleToken(toAddress: AccountId, tokenId: TokenId, serialNumber: number) {
    const transferTokenTransaction = new TransferTransaction()
      .addNftTransfer(tokenId, serialNumber, this.getAccountId(), toAddress);

    const signer = this.getSigner();
    await transferTokenTransaction.freezeWithSigner(signer);
    const txResult = await transferTokenTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  async associateToken(tokenId: TokenId) {
    const associateTokenTransaction = new TokenAssociateTransaction()
      .setAccountId(this.getAccountId())
      .setTokenIds([tokenId]);

    const signer = this.getSigner();
    await associateTokenTransaction.freezeWithSigner(signer);
    const txResult = await associateTokenTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  // Purpose: build contract execute transaction and send to wallet for signing and execution
  // Returns: Promise<TransactionId | null>
  async executeContractFunction(contractId: ContractId, functionName: string, functionParameters: ContractFunctionParameterBuilder, gasLimit: number) {
    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(gasLimit)
      .setFunction(functionName, functionParameters.buildHAPIParams());

    const signer = this.getSigner();
    await tx.freezeWithSigner(signer);
    const txResult = await tx.executeWithSigner(signer);

    // in order to read the contract call results, you will need to query the contract call's results form a mirror node using the transaction id
    // after getting the contract call results, use ethers and abi.decode to decode the call_result
    return txResult ? txResult.transactionId : null;
  }
  disconnect() {
    dappConnector.disconnectAll().then(() => {
      refreshEvent.emit("sync");
    });
  }
};
export const walletConnectWallet = new WalletConnectWallet();

// this component will sync the walletconnect state with the context
export const WalletConnectClient = () => {
  // use the HashpackContext to keep track of the hashpack account and connection
  const { setAccountId, setIsConnected } = useContext(WalletConnectContext);

  // sync the walletconnect state with the context
  const syncWithWalletConnectContext = useCallback(() => {
    const accountId = dappConnector.signers[0]?.getAccountId()?.toString();
    if (accountId) {
      setAccountId(accountId);
      setIsConnected(true);
    } else {
      setAccountId('');
      setIsConnected(false);
    }
  }, [setAccountId, setIsConnected]);

  useEffect(() => {
    // Sync after walletconnect finishes initializing
    refreshEvent.addListener("sync", syncWithWalletConnectContext);

    initializeWalletConnect().then(() => {
      syncWithWalletConnectContext();
    });

    return () => {
      refreshEvent.removeListener("sync", syncWithWalletConnectContext);
    }
  }, [syncWithWalletConnectContext]);
  return null;
};
