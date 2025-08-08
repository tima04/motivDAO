import { AccountId, ContractId, TokenId } from "@hashgraph/sdk";
import { Button, TextField, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { ContractFunctionParameterBuilder } from "../services/wallets/contractFunctionParameterBuilder";
import { useWalletInterface } from "../services/wallets/useWalletInterface";
import SendIcon from '@mui/icons-material/Send';
import { useState } from "react";

export default function Home() {
  const { walletInterface } = useWalletInterface();
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [toAccountId4reward, setToAccountId4reward] = useState("");
  const [amount, setAmount] = useState(1);
  const [serialNumber, setSerialNumber] = useState(1);
  const [tokenId, setTokenId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [topicIdOld, setTopicIdOld] = useState("");

  return (
    <Stack alignItems="center" spacing={4}>
      <Typography
        variant="h4"
        color="white"
      >
       Ready to stick to your goals?
      </Typography>
      {walletInterface !== null && (
        <>
          <Typography variant="h3">
           I commit to 
          </Typography>
          <TextField
            label='Lose 5kg in 30 days!'
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            sx={{
              maxWidth: '400px'
            }} />
          
          <Stack // create topic id 
            direction='row'
            gap={2}
            alignItems='center'
          >
            <Typography>
              Create topic 
            </Typography>
            <Button
              variant='contained'
              onClick={async () => {
                const txId = await walletInterface.createTopic()
                setTopicId(txId ?? "")
                //setTopicId("" ?? "")
              }}
            >
              <SendIcon />
            </Button>
            <TextField
              label='topicId'
              value={topicId}
              sx={{
                maxWidth: '100px'
              }} />
          </Stack>

          <Stack // mint nft 
            direction='row'
            gap={2}
            alignItems='center'
          >
            <Typography>
              Reward NFT
            </Typography>
            <TextField
              onChange={(e) => setToAccountId4reward(e.target.value)}
              label='rewardAccountId'
              value={toAccountId4reward}
              sx={{
                maxWidth: '200px'
              }} />
            <Button
              variant='contained'
              onClick={async () => {
                const txId = await walletInterface.createNFT(AccountId.fromString(toAccountId4reward));
              }}
            >
              <SendIcon />
            </Button>
          </Stack>
            
            <Typography variant="h4">
              Account of referee
            </Typography>
            <TextField
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              label='account id or evm address'
            />
          

          <Typography variant="h4">  
            Message to the referee 
          </Typography>
         <Stack  // referee message
            direction='row'
            gap={2}
            alignItems='center'
          >
          <TextField
            label=''
            fullWidth
            helperText='topic id'
            value={topicIdOld}
            onChange={(e) => setTopicIdOld(e.target.value)}
            sx={{
              maxWidth: '200px'
            }} />
          <TextField
            label=''
            fullWidth
            helperText='Return on success , burn on failure!'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              maxWidth: '200px'
            }} />
            <Button
              variant='contained'
            >
              <SendIcon />
            </Button>
          </Stack>

          <Stack
            direction='row'
            gap={2}
            alignItems='center'
          >
            <Typography>
              Transfer HBAR 
            </Typography>
            <TextField
              type='number'
              label='amount'
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              sx={{
                maxWidth: '100px'
              }} />
            <Button
              variant='contained'
              onClick={async () => {
                const txId = await walletInterface.transferHBAR(AccountId.fromString(toAccountId), amount);
              }}
            >
              <SendIcon />
            </Button>
          </Stack>

          <Stack //NFT
            direction='row'
            gap={2}
            alignItems='center'
          >
            <Typography>
              Transfer NFT
            </Typography>
            <TextField
              label='Token id'
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              sx={{
                maxWidth: '100px'
              }} />
            <TextField
              type='number'
              label='serial number'
              value={serialNumber}
              onChange={(e) => setSerialNumber(parseInt(e.target.value))}
              sx={{
                maxWidth: '100px'
              }} />
            <Button
              variant='contained'
              onClick={async () => {
                //const txId = await walletInterface.transferHBAR(AccountId.fromString(toAccountId), amount);
                const txId = await walletInterface.transferNonFungibleToken(AccountId.fromString(toAccountId), TokenId.fromString(tokenId), serialNumber);
                //const txId = await walletInterface.transferNonFungibleToken(AccountId.fromString(toAccountId), tokenId, serialNumber));
                //transferNonFungibleToken: (toAddress: AccountId, tokenId: TokenId, serialNumber: number) => Promise<TransactionId | string | null>;
              }}
            >
              <SendIcon />
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  )
}