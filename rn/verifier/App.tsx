import { SafeAreaView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import {Button, TextInput, Card } from 'react-native-paper';
import QRCode from 'react-qr-code';
import React, { useEffect, useState } from "react";
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import { ethers, verifyMessage } from "ethers";
import { Alchemy, Network } from "alchemy-sdk";
import Gun from 'gun'
const gun = new Gun({
  peers: [
    `https://gun.up.railway.app/gun`
  ]
})
export default function App() {
  
  const alchemy = new Alchemy({
    apiKey: "9liEkJtCPWYOXnlrcCdbGnlVJTf5I-wn",
    network: Network.ETH_SEPOLIA,
  });
  const [url, setUrl] = useState("");
  const [contract, setContract] = useState("");
  const [results, setResults] = useState("");
  let get_data = (contract: string) => {
    return `https://alantick.vercel.app/signin?t=${Date.now()}&seed=${Math.floor(Math.random() * 10000)}&contract=${contract}`
  }
  useEffect(() => {
    setUrl(get_data(contract))
    const interval = setInterval(() => setUrl(get_data(contract)), 1000 * 3);
    return () => {
      clearInterval(interval);
    };
  }, [])
  const set_used = (contract: string, tokenId: string) => {
    gun.get(contract).get(tokenId).put({ used: true, time: Date.now() });;
  }
  const get_used = (contract: string, tokenId: string) => {
    let ans = { used: false, time: 0 };
    gun.get(contract).get(tokenId).once((token:any) => {
      try {
        console.log(token.used, token.time)
        ans = {
          used: token.used,
          time: token.time
        }
      } catch (e) {
        console.log(e)
      }
      return ans
    });
  }
  const onSuccess = (e: any) => {
    const init = async () => {
      const { address, signature, t, seed, contract, tokenId } = JSON.parse(e)
      const siger_addr = verifyMessage(`${address} 確認使用票券`, signature);

      const owners = (await alchemy.nft.getOwnersForContract(contract)).owners;

      const haveTickets = owners.includes(siger_addr);
      const signatureValid = siger_addr == address;

      setResults(`haveTickets:${haveTickets}, signatureValid:${signatureValid}`)
      if (haveTickets && signatureValid) {
        set_used(contract, tokenId);
      }
    }
    init();

  }
  const [debug, setDebug] = useState("debug");
  return (
    <SafeAreaView style={styles.container}>
      
      <TextInput
        label="contract address"
        placeholder="input contract address"
        onChangeText={(text) => {
          setContract(text)
          setUrl(get_data(text))
        }}
      />
      <Text>{url} </Text>
      <QRCode
        size={256}
        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
        value={JSON.stringify(url)}
        viewBox={`0 0 256 256`}
      />
      <QRCodeScanner
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.off}
        topContent={
          <Text style={styles.centerText}>
            Go to{' '}
            <Text style={styles.textBold}>wikipedia.org/wiki/QR_code</Text> on
            your computer and scan the QR code.
          </Text>
        }
        bottomContent={
          <TouchableOpacity style={styles.buttonTouchable}>
            <Text style={styles.buttonText}>OK. Got it!</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  }
});
