import { Alchemy, Network } from "alchemy-sdk";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SeatPicker from 'react-seat-picker'
import Event_data from "@/artifacts/contracts/Event.sol/Event.json"
import { usePrepareContractWrite, useContractWrite, useContractRead, useAccount } from "wagmi";
import { Text, Heading, Button, Box, SimpleGrid, Stack, Flex, useDisclosure, ModalOverlay, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, FormControl, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper } from "@chakra-ui/react";
import { ethers } from "ethers";
import Gun from 'gun'
import GUN from "@/lib/gun"
import { Tooltip } from '@chakra-ui/react'
import * as CBOR from "@/lib/cbor"
const crypto = require('crypto').webcrypto;
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { startRegistration } from '@simplewebauthn/browser';
import { Field, Form, Formik } from "formik";
export async function getServerSideProps(context: { query: { contract: string; }; }) {
    const { contract } = context.query
    return { props: { contract } }
}
// const gun: any = Gun({
//     peers: [
//         `https://gun.up.railway.app/gun`
//     ]
// })
let g = new GUN()
const gun = g.gun
export default function Contract({ contract }: any) {

    const { address, isConnected } = useAccount()
    
    // let ticket_status: any = gun.get(contract).get("status");;
    const { data: max_tickets } = useContractRead({
        address: contract as `0x${string}`,
        abi: Event_data.abi,
        functionName: 'max_tickets',

    })
    const { data: prices }: any = useContractRead({
        address: contract as `0x${string}`,
        abi: Event_data.abi,
        functionName: 'get_all_price',
    })
    const [loading, setLoading] = useState(false);

    const alchemy = new Alchemy({
        apiKey: "ffCwht8u8k05LaGxxgfVMW5ZdxM0DOgj",
        network: Network.ETH_SEPOLIA,
    });


    const provider = new ethers.AlchemyProvider("sepolia", "ffCwht8u8k05LaGxxgfVMW5ZdxM0DOgj")
    const contract_e = new ethers.Contract(contract, Event_data.abi, provider);
    const { data: base_uri } = useContractRead({
        address: contract as `0x${string}`,
        abi: Event_data.abi,
        functionName: 'base_uri',
    })






    let token_minted: any = null
    const init_seats = async () => {

        if (!token_minted) token_minted = ((await alchemy.nft.getNftsForContract(contract)).nfts).map(({ tokenId }) => { return Number(tokenId) })
        let s: any = []

        for (let i = 0; i < Number(max_tickets) / 10; i++) {
            s.push([])
            for (let j = 0; j < 10; j++) {
                let id = i * 10 + j + 1
                s[i][j] = {
                    id: id,
                    number: (id - 1) % 10,
                    isReserved: token_minted.includes(id - 1),
                    tooltip: `$ ${prices[id - 1]}`,
                }
            }
        }
        return s
    }
    const [seats, setSeats] = useState<any>(null);
    const [cart, setCart] = useState<any>([])
    const [select_id, set_select_id] = useState(0);

    
    const onStatus = (data: any) => {
        init_seats().then((s) => {
            if (data && data.lock) {
                let locks = JSON.parse(data.lock)
                let wait_to_buy: any = []
                locks.map(({ id, address: addr }: any) => {
                    let i = id;

                    if (address === addr) {
                        s[Math.floor(i / 10)][i % 10].isSelected = true;
                        wait_to_buy.push({
                            id: id,
                            price: Number(prices[id])
                        })
                    }
                    else s[Math.floor(i / 10)][i % 10].isReserved = true;

                })
                setCart(wait_to_buy)
                return s

            }
        }).then((s) => {
            if (s) setSeats(s)
        })
    }
    useEffect(() => {

        init_seats().then((s) => {
            setSeats(s)
        })
        // ticket_status.on((data: any) => onStatus(data))
    }, [])


    const handleSelect = ({ id }: any) => {
        let i = id - 1
        if (seats[Math.floor(i / 10)][i % 10].isSelected) {
            seats[Math.floor(i / 10)][i % 10].isSelected = false;
            // ticket_status.once((data: any, key: string) => {
            //     if (data && data.lock) {
            //         let locks = JSON.parse(data.lock)
            //         locks = locks.filter(({ id: id_ }: any) => (id - 1) !== id_)
            //         ticket_status.put({ lock: JSON.stringify(locks) })
            //     }
            // })
        } else {

            seats[Math.floor(i / 10)][i % 10].isSelected = true;
            let save_data = { id: i, time: Date.now(), address: address }
            // ticket_status.once((data: any, key: string) => {
            //     if (data && data.lock) {
            //         let locks = JSON.parse(data.lock)
            //         locks.push(save_data)
            //         ticket_status.put({ lock: JSON.stringify(locks) })
            //     } else ticket_status.put({ lock: JSON.stringify([save_data]) })
            // })
        }
        //console.log(seats[0])
        setSeats([...seats])
    }
    const { data: data7, write: batch_bid } = useContractWrite({ address: contract as `0x${string}`, abi: Event_data.abi, functionName: 'batch_bid' });
    const { data: data8, write: claim } = useContractWrite({ address: contract as `0x${string}`, abi: Event_data.abi, functionName: 'claim' });

    const handle_bid = () => {
        let ids: any = [];
        let prices_:any = [];
        let total_price = 0
        cart.map(({ id, price }: any) => {
            ids.push(id)
            prices_.push(price)
            total_price += price
        })
        
        console.log(ids, total_price)

        return batch_bid({ args: [ids,prices_ ], value: BigInt(total_price) })

    }


    const { isOpen, onOpen, onClose } = useDisclosure()
    return (<>
        <w3m-button />

        <Heading>選位</Heading>
        {/* <Button onClick={() => ticket_status.put(null)}>remove</Button> */}
        <Button onClick={() => handle_bid()}>{`buy(${cart.length})`}</Button>
        <Button onClick={() => claim()}>claim</Button>
        <br/>
        {JSON.stringify(cart)}
        <SimpleGrid columns={10} spacing='10px' maxW={"md"} >
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>bid</ModalHeader>
                    <ModalCloseButton />
                    <Formik
                        initialValues={{
                            price: ""
                        }}
                        onSubmit={(values, actions) => {
                            prices[select_id] = Number(values.price)
                            
                            let cart_ = [...cart]
                            
                            //cart_.map((c)=>c.price = (select_id - 1===c.id)?prices[select_id - 1]:c.price)
                            cart_.push({price: Number(values.price), id: select_id})
                            console.log(cart_)
                            setCart([...cart_])
                            onClose()
                        }

                        }
                    >
                        {(props) => (
                            <Form>
                                <ModalBody>
                                    <Field name="price">
                                        {({ field, form }: any) => (
                                            <FormControl>
                                                <FormLabel>price</FormLabel>
                                                <Input {...field} placeholder={prices[select_id - 1]} />

                                            </FormControl>
                                        )}
                                    </Field>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        mt={4}
                                        colorScheme='teal'
                                        //isLoading={isLoading}//{props.isSubmitting}
                                        type='submit'
                                    >
                                        設定
                                    </Button>
                                </ModalFooter>
                            </Form>
                        )}
                    </Formik>
                </ModalContent>
            </Modal>

            {seats && seats.map((rows: any, j: number) => {
                return rows.map((s: any, i: number) => {
                    return (
                        <Stack key={i + j} ml={(i > 0) ? 5 : 0} flexDirection={"row"}>
                            {i === 0 && <Text minW={3}>{String.fromCharCode(65 + j)}</Text>}

                            <Tooltip label={`${s.tooltip}`}>
                                <Box
                                    onClick={() => {
                                        set_select_id(s.id-1)
                                        if (!s.isSelected && !s.isReserved) onOpen()
                                        handleSelect(s)


                                    }} as={Button} //handleSelect(s)
                                    isDisabled={s.isReserved}
                                    bg={(s.isSelected) ? 'tomato' : "grayAlpha"}
                                    _hover={{
                                        transform: "scale(1.03)",
                                        transition: "transform .15s ease-in",
                                        backgroundColor: (s.isSelected) ? 'tomato' : "yellow"
                                    }}> {s.number}</Box>

                            </Tooltip>
                        </Stack>)
                })
            })}
        </SimpleGrid>

        {/* {JSON.stringify(seats)} */}
    </>

    )
}