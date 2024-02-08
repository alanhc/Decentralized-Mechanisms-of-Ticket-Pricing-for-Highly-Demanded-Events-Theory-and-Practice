import { TouchableOpacity, Pressable, View, StyleSheet } from 'react-native';
// You can import supported modules from npm
import contract_addr from "./config/contract-address.json"
import Event_data from "./config/EventFactory.json"



// import { usePrepareContractWrite, useContractWrite, useContractEvent, useWaitForTransaction } from 'wagmi'

import {
  Text,
  TextInput,
  Card,
  Appbar,
  BottomNavigation,
  Menu,
  useTheme,
  Button
} from 'react-native-paper';
import { useEffect, useState } from 'react';
import { Formik } from 'formik';
import "@ethersproject/shims"
import { Contract, ethers } from "ethers";
import { WalletConnectModal, useWalletConnectModal } from '@walletconnect/modal-react-native'
import { RequestModal } from './components/RequestModal';


const API_KEY = "9liEkJtCPWYOXnlrcCdbGnlVJTf5I-wn";

const OrganizerRoute = () => {
  const { isOpen, open, close, provider, isConnected, address } = useWalletConnectModal();
  const [client, setClient] = useState<any>();
  const [create_addr, setCreate_addr] = useState("no address");
  useEffect(() => {

    if (isConnected && provider) {
    
      const _client = new ethers.BrowserProvider(provider);
      setClient(_client);
    }
  }, [isConnected, provider]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rpcResponse, setRpcResponse] = useState<any>();
  const onResponse = (response: any) => {
    setRpcResponse(response);
    setLoading(false);
  };
  const onAction = (callback: any) => async () => {
    try {
      setLoading(true);
      setModalVisible(true);
      const response = await callback();
      onResponse(response);
    } catch (error: any) {
      onResponse({
        error: error?.message || 'error',
      });
    }
  };
  const onModalClose = () => {
    setModalVisible(false);
    setLoading(false);
    setRpcResponse(undefined);
  };
  const onWriteContract = async (values: any) => {
    // const [address] = await client.listAccounts();
    console.log(String(address))
    const signer = await client.getSigner(address);

    const ef_contract = new ethers.Contract(
      contract_addr.event_factory as `0x${string}`,
      Event_data.abi,
      signer,
    );
    const receipt = await ef_contract.createEvent(values.name, values.symbol, values.max_supply, values.max_presale, values.max_price_factor);

    const events: any = await ef_contract.queryFilter(ef_contract.filters.EventCreated, receipt?.blockNumber, receipt?.blockNumber)
    const event_created_addr = events[0].args[0];
    setCreate_addr(event_created_addr)

  }
  const onConnect = () => {
    if (isConnected) {
      return provider?.disconnect();
    }
    return open();
  };
  return (
    <View>
      <Formik
        initialValues={{
          name: "name",
          symbol: "symbol",
          max_supply: 100,
          max_presale: 10,
          max_price_factor: 1
        }}
        onSubmit={(values) => {

          onAction(onWriteContract(values))
        }
        }>
        {({ handleChange, handleBlur, handleSubmit, values }) => (
          <View>
            <TextInput
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
            />
            <TextInput
              onChangeText={handleChange('symbol')}
              onBlur={handleBlur('symbol')}
              value={values.symbol}
            />
            <TextInput
              onChangeText={handleChange('max_supply')}
              onBlur={handleBlur('max_supply')}
              value={String(values.max_supply)}
            />
            <TextInput
              onChangeText={handleChange('max_presale')}
              onBlur={handleBlur('max_presale')}
              value={String(values.max_presale)}
            />
            <TextInput
              onChangeText={handleChange('symbmax_price_factorol')}
              onBlur={handleBlur('max_price_factor')}
              value={String(values.max_price_factor)}
            />
            <Button onPress={() => handleSubmit()}>Submit </Button>
          </View>
        )}
      </Formik>
      <View >
        <Button onPress={() => onConnect()}>
          <Text>{isConnected ? `Disconnect:${address && address.slice(-4,)}` : 'Connect'}</Text>
        </Button>
        <WalletConnectModal
          projectId={"ce0cb9232cf0da5feaf0645784ef736d"}
          providerMetadata={{
            name: 'alantick',
            description: 'test',
            url: 'https://alantick.vercel.app',
            icons: [],
            redirect: {
              native: 'alantick://',
              //universal: 'YOUR_APP_UNIVERSAL_LINK.com'
            }
          }}
          sessionParams={{
            namespaces: {
              eip155: {
                methods: ['eth_sendTransaction', 'personal_sign'],
                chains: ['eip155:11155111'],
                events: ['chainChanged', 'accountsChanged'],
                rpcMap: {},
              },
            },
          }}
        />
        <RequestModal
          isVisible={modalVisible}
          onClose={onModalClose}
          isLoading={loading}
          rpcResponse={rpcResponse}
        />
         <Text>{`:::::${create_addr}`}</Text>
      </View>

     
    </View>

  )
}


const CustomerRoute = () => <Text>Albums</Text>;

export default function App() {

  const [index, setIndex] = useState(0);
  const renderScene = BottomNavigation.SceneMap({
    organizer: OrganizerRoute,
    customer: CustomerRoute,
  });
  const [routes] = useState([
    {
      key: 'organizer',
      title: 'Organizer',
      focusedIcon: 'heart',
      unfocusedIcon: 'heart-outline',
    },
    { key: 'customer', title: 'Customer', focusedIcon: 'album' },
  ]);

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  
  );
}
