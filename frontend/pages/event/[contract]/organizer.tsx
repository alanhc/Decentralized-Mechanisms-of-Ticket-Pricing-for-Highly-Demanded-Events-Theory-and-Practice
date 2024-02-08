import { Select, Box, Heading, Stack, Button, FormControl, FormLabel, Input, Container, Center } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useContractRead } from 'wagmi'
import contract_addr from "@/config/contract-address.json"
import Event_data from "@/artifacts/contracts/Event_v0.sol/Event_v0.json"
import { Formik, Form, Field } from 'formik'
import { write } from 'fs'
import { usePrepareContractWrite, useContractWrite } from "wagmi";

export default function Organizer() {
    const router = useRouter()
    const { data:max_tickets, isError, isLoading } = useContractRead({
        address: router.query.contract as `0x${string}`,
        abi: Event_data.abi,
        functionName: 'max_tickets',
    })
    const options: string[] = []
    for (let i = 0; i < Number(max_tickets); i++) {
        options.push(`${i}`)
    }

    // Hook contract functions
    const { data: data1, write: set_tickets } = useContractWrite({ address: router.query.contract as `0x${string}`, abi: Event_data.abi, functionName: 'set_tickets' });
    const { data: data2, write: set_batch_tickets } = useContractWrite({ address: router.query.contract as `0x${string}`, abi: Event_data.abi, functionName: 'set_batch_tickets' });
    const { data: data3, write: get_winners } = useContractWrite({ address: router.query.contract as `0x${string}`, abi: Event_data.abi, functionName: 'get_winners' });
    const { data: data4, write: cancel } = useContractWrite({ address: router.query.contract as `0x${string}`, abi: Event_data.abi, functionName: 'cancel' });
    const { data: data5, write: withdraw } = useContractWrite({ address: router.query.contract as `0x${string}`, abi: Event_data.abi, functionName: 'withdraw' });
    const { data: data6, write: set_base_uri } = useContractWrite({ address: router.query.contract as `0x${string}`, abi: Event_data.abi, functionName: 'set_base_uri' });
    const { data: data7, write: set_income } = useContractWrite({ address: router.query.contract as `0x${string}`, abi: Event_data.abi, functionName: 'set_income' });

    

    return (<>
        <Stack>
            <Box>{router.query.contract}</Box>
            
            <Formik
                initialValues={{
                    tokenId: "select_all",
                    price: ""
                }}
                onSubmit={(values, actions) => {
                    console.log("-",values)
                    if (values.tokenId == "select_all") {
                        //set_batch_tickets({ args: [values.price] })
                        set_tickets({ args: [[0,1,2,3], [0,0,0,0], [0,0,0,0], [0,0,0,0], [10,10,10,10], [0,0,0,0]] })
                    } else {
                        set_tickets({ args: [values.tokenId, values.price] })
                    }
                }
                }
            >
                {(props) => (
                    <Form>
                        <Field name="tokenId">
                            {({ field, form }: any) => (
                                <FormControl>
                                    <Select placeholder='select_all'>
                                        {options.map((o,i) => <option key={i} value={o}>{o}</option>)}
                                    </Select>
                                </FormControl>
                            )}
                        </Field>
                        <Field name="price">
                            {({ field, form }: any) => (
                                <FormControl>
                                    <FormLabel>floor price</FormLabel>
                                    <Input {...field} placeholder={""} />
                                </FormControl>
                            )}
                        </Field>
                        <Button
                            mt={4}
                            colorScheme='teal'
                            isLoading={isLoading}//{props.isSubmitting}
                            type='submit'
                        >
                            設定
                        </Button>
                    </Form>
                )}
            </Formik>
            <Formik
                initialValues={{
                    ipfs: "",
                }}
                onSubmit={(values, actions) => set_base_uri({args:[values.ipfs]})
                }
            >
                {(props) => (
                    <Form>
                        <Field name="ipfs">
                            {({ field, form }: any) => (
                                 <FormControl>
                                 <FormLabel>base uri</FormLabel>
                                 <Input {...field} placeholder={""} />
                             </FormControl>
                            )}
                        </Field>
                        <Button
                            mt={4}
                            colorScheme='teal'
                            isLoading={isLoading}//{props.isSubmitting}
                            type='submit'
                        >
                            設定
                        </Button>
                    </Form>
                )}
            </Formik>
            <Formik
                initialValues={{
                    i:"",
                    address: "",
                    percentage: ""
                }}
                onSubmit={(values, actions) => set_income({args:[values.i, values.address, values.percentage]})
                }
            >
                {(props) => (
                    <Form>
                        <Field name="i">
                            {({ field, form }: any) => (
                                 <FormControl>
                                 <FormLabel>i</FormLabel>
                                 <Input {...field} placeholder={""} />
                             </FormControl>
                            )}
                        </Field>
                        <Field name="address">
                            {({ field, form }: any) => (
                                 <FormControl>
                                 <FormLabel>address</FormLabel>
                                 <Input {...field} placeholder={""} />
                             </FormControl>
                            )}
                        </Field>
                        <Field name="percentage">
                            {({ field, form }: any) => (
                                 <FormControl>
                                 <FormLabel>percentage</FormLabel>
                                 <Input {...field} placeholder={""} />
                             </FormControl>
                            )}
                        </Field>
                        <Button
                            mt={4}
                            colorScheme='teal'
                            isLoading={isLoading}//{props.isSubmitting}
                            type='submit'
                        >
                            設定
                        </Button>
                    </Form>
                )}
            </Formik>
            <Center>
                <Button onClick={() => get_winners()}>預售結束</Button>
            </Center>
            <Center>
                <Button onClick={() => cancel()}>活動取消</Button>
            </Center>
            <Center>
                <Button onClick={() => withdraw()}>取款</Button>
            </Center>
        </Stack>
    </>
    )
}