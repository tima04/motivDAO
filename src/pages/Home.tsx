import { AccountId, ContractId, TokenId } from "@hashgraph/sdk";
import { ContractFunctionParameterBuilder } from "../services/wallets/contractFunctionParameterBuilder";
import { useWalletInterface } from "../services/wallets/useWalletInterface";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import SendIcon from '@mui/icons-material/Send';
import { useState } from "react";

import { Stack } from "@mui/system";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
} from "@mui/material";


const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: 16 * 1.2,//
  },
});

export default function Home() {
  // backend 
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

  const [page, setPage] = useState("intro");
  const [step, setStep] = useState(1);
  const [referee, setReferee] = useState("");
  const [commitmentText, setCommitmentText] = useState("");
  //const [topicId, setTopicId] = useState("");
  const [hbar, setHbar] = useState("");
  const [nft, setNft] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stakeConsequence, setStakeConsequence] = useState("be burned");
  const [judgmentOutcome, setJudgmentOutcome] = useState("achieved");
  const [stakeAction, setStakeAction] = useState("burn");
  const [judgmentFields, setJudgmentFields] = useState({ hbar: "", nft: "", accountId: "" });

  const handleCommitmentNext = () => setStep(step + 1);
  const handleCommitmentBack = () => setStep(step - 1);
  const handleSendStake = () => setPage("success");
  const handleSubmitJudgment = () => setPage("refereeSuccess");

  return (
    <ThemeProvider theme={darkTheme}>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        {page === "intro" && (
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>I want to</Typography>
            <Box display="flex" flexDirection="column" gap={2} mt={3}>
              <Button variant="contained" onClick={() => { setPage("commit"); setStep(1); }}>Make a commitment</Button>
              <Button variant="outlined" onClick={() => setPage("referee")}>Make a referee judgment</Button>
            </Box>
          </Paper>
        )}

        {page === "commit" && step === 1 && (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom align="center">I commit to</Typography>
            <TextField fullWidth label="Your goal" value={commitmentText} onChange={(e) => setCommitmentText(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Start Date" type="date" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="End Date" type="date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} sx={{ mb: 2 }} />
            <Typography variant="subtitle1">As a stake, I will put down</Typography>
            <Box display="flex" gap={2} mb={2}>
              <TextField fullWidth label="Amount of HBAR" value={hbar} onChange={(e) => setHbar(e.target.value)} />
              <TextField fullWidth label="NFT ID" value={nft} onChange={(e) => setNft(e.target.value)} />
            </Box>
            <TextField fullWidth 
              label='Referee account id or evm address'
              value={toAccountId} 
              onChange={(e) => setReferee(e.target.value)} sx={{ mb: 2 }} />
            <Typography variant="body1">In the event that I fail to meet my commitment, my stake should</Typography>
            <Select fullWidth value={stakeConsequence} onChange={(e) => setStakeConsequence(e.target.value)} sx={{ mb: 3 }}>
              <MenuItem value="be burned">be burned</MenuItem>
              <MenuItem value="go to a charity">go to a charity</MenuItem>
              <MenuItem value="stay with the referee">stay with the referee</MenuItem>
            </Select>

            <Typography variant="body1">
              Create Topic ID
              </Typography>
            <Button
              variant='contained'
              onClick={async () => {
                const txId = await walletInterface.createTopic(goal)
                setTopicId(txId ?? "")
              }}
            >
              <SendIcon />
            </Button>
            <TextField
              label='topicId'
              value={topicId}
              sx={{
                maxWidth: '200px'
              }} />

            <Button fullWidth variant="contained" onClick={handleCommitmentNext}>Next Step</Button>
          </Paper>
        )}

        {page === "commit" && step === 2 && (
          <Paper elevation={3} sx={{ p: 4 }}>
            <TextField
              fullWidth
              multiline
              minRows={6}
              value={`Topic ID: ${topicId}
I commit to: ${commitmentText}
Start date: ${startDate}
End date: ${endDate}

My referee: ${referee}


As a stake I will put down: ${hbar ? `${hbar} HBAR` : ""}${hbar && nft ? " and " : ""}${nft ? `NFT ID ${nft}` : ""}
In the event that I fail to meet my commitment, my stake should ${stakeConsequence}.`}
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Share the topic ID with your referee and supporters.</Typography>

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

            <Box display="flex" gap={2}>
              <Button fullWidth variant="outlined" onClick={handleCommitmentBack}>Back</Button>
              <Button fullWidth variant="contained" onClick={handleSendStake}>Next</Button>
            </Box>

          </Paper>
        )}

        {page === "referee" && (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>Make your referee judgment</Typography>
            <Select fullWidth value={judgmentOutcome} onChange={(e) => setJudgmentOutcome(e.target.value)} sx={{ mb: 3 }}>
              <MenuItem value="achieved">The goal was achieved – well done!</MenuItem>
              <MenuItem value="failed">The goal was not achieved</MenuItem>
            </Select>

            {judgmentOutcome === "achieved" && (
              <>
                <Typography variant="body1">I will return the stake</Typography>
            <TextField onChange={(e) => setToAccountId4reward(e.target.value)} 
            label='rewardAccountId' 
            value={toAccountId4reward} sx={{
                maxWidth: '200px'
              }} />
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
                const txId = await walletInterface.transferNonFungibleToken(AccountId.fromString(toAccountId), TokenId.fromString(tokenId), serialNumber);
              }}
            >
              <SendIcon />
            </Button>
          </Stack>
              <Button fullWidth variant="outlined">🎖️ Mint Reward NFT (optional)</Button>
                
          <Stack // mint nft 
            direction='row'
            gap={2}
            alignItems='center'
          >
            <Typography>
              Reward NFT
            </Typography>
            <Button
              variant='contained'
              onClick={async () => {
                const txId = await walletInterface.createNFT(AccountId.fromString(toAccountId4reward));
              }}
            >
              <SendIcon />
            </Button>
          </Stack>
              </>
            )}

            {judgmentOutcome === "failed" && (
              <>
                <Select fullWidth value={stakeAction} onChange={(e) => setStakeAction(e.target.value)} sx={{ mb: 3 }}>
                  <MenuItem value="burn">I will burn the stake</MenuItem>
                  <MenuItem value="donate">I will donate the stake</MenuItem>
                  <MenuItem value="keep">I will keep the stake</MenuItem>
                </Select>
                {stakeAction !== "keep" && (
                  <>
                    <TextField fullWidth label="Amount of HBAR" sx={{ mb: 2 }} />
                    <TextField fullWidth label="NFT ID" sx={{ mb: 2 }} />
                    <TextField fullWidth label="Account ID" sx={{ mb: 2 }} />
                  </>
                )}
              </>
            )}

            <Button fullWidth variant="contained" onClick={handleSubmitJudgment}>Submit judgment</Button>
          </Paper>
        )}

        {page === "success" && (
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>🎉 You’re committed!</Typography>
            <Typography>Your commitment has been recorded and shared with your referee.</Typography>
            <Button variant="contained" onClick={() => setPage("intro")} sx={{ mt: 3 }}>Return to main page</Button>
          </Paper>
        )}

        {page === "refereeSuccess" && (
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>✅ Judgment submitted</Typography>
            <Typography>Thank you for supporting the commitment journey! Your judgment has been recorded.</Typography>
            <Button variant="contained" onClick={() => setPage("intro")} sx={{ mt: 3 }}>Return to main page</Button>
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
}

