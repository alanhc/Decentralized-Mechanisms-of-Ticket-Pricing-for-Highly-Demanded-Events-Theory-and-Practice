import { Box, Button, Center, Container, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import QRCode from "react-qr-code";

import { ethers, verifyMessage } from "ethers";
//import { create } from 'ipfs-core'
import { create } from 'ipfs-http-client'



import Html5QrcodePlugin from "@/components/Html5QrcodePlugin"
import { useSDK } from '@metamask/sdk-react';

import GUN from "@/lib/gun"
import ALCHEMY from '@/lib/alchemy';
import { useSearchParams } from 'next/navigation'
import { createHelia } from 'helia'

export async function getServerSideProps(context: any) {

  const contract = context.query.contract
  return { props: { contract } }
}

export default function Verifier({ contract }: any) {


  const alchemy = new ALCHEMY();
  const db = new GUN();
  const [results, setResults] = useState("");
  const { sdk, connected, connecting, provider, chainId } = useSDK();
  const [url, setUrl] = useState("")

  let get_data = () => {
    return `${process.env.DEPLOY_URL}/signin?t=${Date.now()}&seed=${Math.floor(Math.random() * 10000)}&contract=${contract}`
  }
  useEffect(() => {

    setUrl(get_data())
    const interval = setInterval(() => setUrl(get_data()), 1000 * 60);
    console.log("a")
    return () => {
      clearInterval(interval);
    };
  }, [contract])



  const onScanSuccess = (results_: string) => {
    const init = async () => {
      const { address, signature, t, seed, contract, tokenId } = JSON.parse(results_)
      const siger_addr = verifyMessage(`${address} 確認使用票券`, signature);
      //const contract_ = "0xe785E82358879F061BC3dcAC6f0444462D4b5330";

      // Get owners 
      const owners = (await alchemy.nft.getOwnersForContract(contract)).owners;

      const haveTickets = owners.includes(siger_addr);
      const signatureValid = siger_addr == address;

      //setResults(`${(siger_addr == address)?"valid":"not valid"}`)
      setResults(`haveTickets:${haveTickets}, signatureValid:${signatureValid}`)
      if (haveTickets && signatureValid) {
        db.set_used(contract, tokenId);
      }
    }
    init();
  }


  if (url) {
    return (
      <>

        {/* <Box>{`${url}`}</Box> */}

        <Stack>

          <div style={{ height: "auto", margin: "0 auto", maxWidth: 256, width: "100%" }}>
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={JSON.stringify(url)}
              viewBox={`0 0 256 256`}
            />
          </div>

          <Center>

            <Html5QrcodePlugin
              fps={10}
              qrbox={256}
              disableFlip={false}
              qrCodeSuccessCallback={(_results: string) => onScanSuccess(_results)}
            />

          </Center>
          <Center>{results}</Center>

        </Stack>

      </>
    )
  } else {
    return (<>loading...</>)
  }

}
