import { Box, Button, Center, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, useDisclosure } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { usePrepareContractWrite, useContractWrite, useContractRead, useAccount } from "wagmi";
import Event_data from "@/artifacts/contracts/Event_v0.sol/Event_v0.json"
import { parseEther } from 'ethers';
import { Web3Button } from '@web3modal/react';
import { Formik, Form, Field } from 'formik';
import { write } from 'fs';
import { useState } from 'react';
import useSWR from 'swr'
import ProductDetails from '@/components/ProductDetails';
import GUN from '@/lib/gun';
export default function Token() {
    const db = new GUN();
    const router = useRouter()
    const { tokenId, contract } = router.query
    const [metadata, setMetadata] = useState({
        name: "",
        attributes: [],
        image: "",
        description: "",
        time: 0,
        location: "",
        price: 0,
        seat: "",
        contract: "",
        tokenId: 0,
    })
    const { data: data1, write: buy } = useContractWrite({ address: contract as `0x${string}`, abi: Event_data.abi, functionName: 'batch_buy' });
    const { data: data2, write: register } = useContractWrite({ address: contract as `0x${string}`, abi: Event_data.abi, functionName: 'register' });
    const { data: data3, write: refund } = useContractWrite({ address: contract as `0x${string}`, abi: Event_data.abi, functionName: 'refund' });
    const { data: data4, write: list_on_marketplace } = useContractWrite({ address: contract as `0x${string}`, abi: Event_data.abi, functionName: 'list_on_marketplace' });

    const { data: base_uri } = useContractRead({
        address: router.query.contract as `0x${string}`,
        abi: Event_data.abi,
        functionName: 'base_uri',
        onSettled(data, error) {
            const init = async () => {
                const _ = data as string;
                const meta = await (await fetch(`${_.replace("ipfs://", "https://ipfs.filebase.io/ipfs/")}/${tokenId}`)).json()
                console.log(meta)
                setMetadata({
                    buy, register, refund, list_on_marketplace,
                    isUsed:db.get_used(contract as string , tokenId as string),
                    address: address,
                    contract: contract,
                    tokenId: tokenId, ...meta,
                });
            }
            init()

        },
    })
    const { data: price } = useContractRead({
        address: router.query.contract as `0x${string}`,
        abi: Event_data.abi,
        functionName: 'get_price',
        args: [tokenId],
    })
    const { data: max_price_factor } = useContractRead({
        address: router.query.contract as `0x${string}`,
        abi: Event_data.abi,
        functionName: 'max_price_factor',
    })
    const { address, isConnected } = useAccount({})

    

    return (<>
        <Stack>
            <Center>
                <w3m-button />
            </Center>
            <ProductDetails {...metadata} />
            {/* <Box>售價：{`${price}`} 最大轉售倍率： {`${max_price_factor}`} {`${JSON.stringify(metadata)}`}</Box>

            <Box>{router.query.contract} {router.query.tokenId}</Box> */}




        </Stack>
    </>)
}