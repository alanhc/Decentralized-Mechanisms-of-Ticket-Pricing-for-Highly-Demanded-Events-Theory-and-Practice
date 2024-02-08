import { Box, Button, Center, Container, Icon, Stack, useToast } from '@chakra-ui/react'
import QRCode from "react-qr-code";
import { BrowserProvider, ethers, JsonRpcSigner } from "ethers";
import { useEffect, useState } from 'react';
import { useSDK } from '@metamask/sdk-react';
// import { IWeb3Context, useWeb3Context } from "../context/Web3Context";
import { FaEthereum } from 'react-icons/fa';
import { BiLogOut } from 'react-icons/bi';
import Html5QrcodePlugin from "@/components/Html5QrcodePlugin"
import { useSearchParams } from 'next/navigation'
import ALCHEMY from '@/lib/alchemy';

import { useSignMessage, useWalletClient, useAccount, useConnect, useDisconnect } from 'wagmi'
import { Web3Button } from '@web3modal/react'

const { Alchemy, Network } = require("alchemy-sdk");
export default function Home() {
  const [tokens, setTokens] = useState<null|number[]>(null);
  const alchemy = new Alchemy({
    apiKey: "ffCwht8u8k05LaGxxgfVMW5ZdxM0DOgj",
    network: Network.ETH_SEPOLIA,
  });

  const { address, isConnected } = useAccount()
  const searchParams = useSearchParams()
  //const { data: walletClient } = useWalletClient()
  const seed = searchParams.get('seed');
  const t = searchParams.get('t');
  const contract_addr = searchParams.get('contract');
  const [nfts, setNfts] = useState([])
  
  useEffect(() => {
    const init = async () => {
      console.log("init")
      if (address) {
        const nfts_ = (await alchemy.nft.getNftsForOwner(address, {
          contractAddresses: ["0x3577c638523bA97AE3C868d3b51f245a84cf5Ce2"],
        })).ownedNfts;
        let ans:number[] = nfts.map((nft:{tokenId:number})=>{return nft.tokenId}) 
        console.log(ans)
        setTokens(ans)
        setNfts(nfts_)        
      }
      
    }
    init()
  }, [isConnected])
  //const [message, setMessage] = useState('')
  
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: `${address} 確認使用票券`,
    onSuccess(data) {

      let ans = nfts.map((nft:any)=>{return nft.tokenId}) 
      
      setTokens(ans)
      //console.log('Success', data)
    },
  })
  const [results, setResults] = useState("");
  const [tokenId, setTokenId] = useState<null | number>(null);
  const [start, setStart] = useState(0);
  const [evt, setEvt] = useState(0)
  return (
    <>
    {evt}

      <Stack>
        <Center>
          <w3m-button />
        </Center>
        {/* {<Center>
          {JSON.stringify(address)}
        </Center>} */}
        {tokenId === null&& tokens && tokens.map((token,i)=>
          <Button key={i} onClick={()=>{
            setTokenId(token)

            setEvt((Date.now()-start)/1000)
          }}>{`use ticket# ${token}`}</Button>
        )}
        {<Button disabled={isLoading} onClick={() => {
      
          setStart(Date.now())
          signMessage()
        }
        }>
          sign
        </Button>}
        {`t:${evt}`}
        {tokenId !== null && isSuccess && <div style={{ height: "auto", margin: "0 auto", maxWidth: 256, width: "100%" }}>
          <QRCode
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={JSON.stringify({
              address: address,
              signature: data,
              t: t,
              seed: seed,
              contract: contract_addr,
              tokenId: tokenId
            })}
            viewBox={`0 0 256 256`}
          />
        </div>}
        {tokenId !== null && isSuccess && <Box>
          {JSON.stringify({
            address: address,
            signature: data,
            t: t,
            seed: seed,
            contract: contract_addr,
            tokenId: tokenId
          })}
        </Box>}

      </Stack>

    </>
  )
}
