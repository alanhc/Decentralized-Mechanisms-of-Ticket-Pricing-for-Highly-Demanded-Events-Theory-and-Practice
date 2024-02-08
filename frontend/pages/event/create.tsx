import { Button, Center, FormControl, FormErrorMessage, FormLabel, Input, Stack } from "@chakra-ui/react";
import { Field, Form, Formik } from 'formik';
import contract_addr from "@/config/contract-address.json"
import Event_data from "@/artifacts/contracts/Event.sol/EventFactory.json"

import { usePrepareContractWrite, useContractWrite, useContractEvent, useWaitForTransaction } from 'wagmi'
import { useState } from "react";
import Link from "next/link";
import { Web3Button } from '@web3modal/react'

export default function CreateEvent() {
    //console.log(contract_addr.event_factory)
    const [address, setAddress] = useState("")
    useContractEvent({
        address: contract_addr.event_factory as `0x${string}`,
        abi: Event_data.abi,
        eventName: 'EventCreated',
        listener(log: any) {
            console.log("log:",log)
            setAddress(log[0].args[0])
        },
    })

    const { data, write, isSuccess } = useContractWrite({
        address: contract_addr.event_factory as `0x${string}`,
        abi: Event_data.abi,
        functionName: 'createEvent',
    })
    const { isError, isLoading } = useWaitForTransaction({
        hash: data?.hash,
    })

    const metadatas = [
        {
            name: "name",
            display: "Event name",
            type: "text"
        },
        {
            name: "symbol",
            display: "Token symbol",
            type: "text"
        },
        {
            name: "max_supply",
            display: "Max supply",
            type: "number"
        },
        {
            name: "max_presale",
            display: "Max presale",
            type: "number"
        },
       
    ]
    return (<>
        <Stack>
        <Center>
          <w3m-button />
        </Center>
            <Formik
                initialValues={{
                    name: "",
                    symbol: "",
                    max_supply: "",
                    max_presale: "",
                }}
                onSubmit={(values, actions) => {
                    write({
                        args: [values.name, values.symbol, values.max_supply, values.max_presale]
                    })
                }
                }
            >
                {(props) => (
                    <Form>
                        {metadatas.map((metadata_,i) => (
                            <Field key={i} name={metadata_.name}>
                                {({ field, form }: any) => (
                                    <FormControl>
                                        <FormLabel>{metadata_.display}</FormLabel>
                                        <Input {...field} placeholder={""} />
                                    </FormControl>
                                )}
                            </Field>
                        ))}
                        <Button
                            mt={4}
                            colorScheme='teal'
                            isLoading={isLoading}//{props.isSubmitting}
                            type='submit'
                        >
                            建立活動
                        </Button>
                    </Form>
                )}
            </Formik>
            {address && <Link href={`/event/${address}/organizer`}>go to : {address}</Link>}
        </Stack>
    </>)
}