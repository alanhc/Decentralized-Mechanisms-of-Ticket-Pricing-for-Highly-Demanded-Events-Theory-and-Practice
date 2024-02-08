'use client'
import Event_data from "@/artifacts/contracts/Event.sol/Event.json"
import {
    Box,
    chakra,
    Container,
    Stack,
    Text,
    Image,
    Flex,
    VStack,
    Button,
    Heading,
    SimpleGrid,
    StackDivider,
    useColorModeValue,
    VisuallyHidden,
    List,
    ListItem,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
} from '@chakra-ui/react'
import { MdLocalShipping } from 'react-icons/md'
import moment from "moment"
import { useContractWrite } from '@metamask/sdk-react-ui';
import { Formik, Form, Field } from 'formik';
import router from 'next/router';
export function CustomButton({children, onClick}:any) {
    return <Button
    onClick={onClick}
    rounded={'none'}
    w={'full'}
    mt={0}
    size={'lg'}
    py={'3'}
    bg={useColorModeValue('gray.900', 'gray.50')}
    color={useColorModeValue('white', 'gray.900')}
    textTransform={'uppercase'}
    _hover={{
        transform: 'translateY(2px)',
        boxShadow: 'lg',
    }}>
    
    {children}
</Button>
}
export default function ProductDetails({ isUsed, address, name, attributes, image, description, time, location, price, seat, contract, tokenId,buy, register, refund, list_on_marketplace }: any) {
    console.log(contract)
    const { isOpen, onOpen, onClose } = useDisclosure()
   
    
    
   
    return (
        <Container maxW={'7xl'}>
            <SimpleGrid
                columns={{ base: 1, lg: 2 }}
                spacing={{ base: 8, md: 10 }}
                py={{ base: 18, md: 24 }}>
                <Flex>
                    <Image
                        rounded={'md'}
                        alt={'product image'}
                        src={
                            image.replace("ipfs://", "https://ipfs.filebase.io/ipfs/")
                        }
                        fit={'contain'}
                        align={'center'}
                        w={'100%'}
                        h={{ base: '100%', sm: '400px', lg: '500px' }}
                    />
                </Flex>
                <Stack spacing={{ base: 6, md: 10 }}>
                    <Box as={'header'}>
                        <Heading
                            lineHeight={1.1}
                            fontWeight={600}
                            fontSize={{ base: '2xl', sm: '4xl', lg: '5xl' }}>
                            {`${name} # ${tokenId}`}
                        </Heading>
                        <Text
                            color={useColorModeValue('gray.900', 'gray.400')}
                            fontWeight={300}
                            fontSize={'2xl'}>
                            {`$ ${price} `}
                        </Text>
                    </Box>

                    <Stack
                        spacing={{ base: 4, sm: 6 }}
                        direction={'column'}
                        divider={
                            <StackDivider borderColor={useColorModeValue('gray.200', 'gray.600')} />
                        }>
                        <VStack spacing={{ base: 4, sm: 6 }}>
                            <Text fontSize={'lg'}>
                                {description}
                            </Text>
                        </VStack>
                        <Box>
                            <Text
                                fontSize={{ base: '16px', lg: '18px' }}
                                color={useColorModeValue('yellow.500', 'yellow.300')}
                                fontWeight={'500'}
                                textTransform={'uppercase'}
                                mb={'4'}>
                                Attributes
                            </Text>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                                <List spacing={2}>
                                    {attributes.map((a: any, i:number) => (
                                        <ListItem key={i}>{a.value}</ListItem>
                                    ))}
                                </List>
                            </SimpleGrid>
                        </Box>
                        <Box>
                            <Text
                                fontSize={{ base: '16px', lg: '18px' }}
                                color={useColorModeValue('yellow.500', 'yellow.300')}
                                fontWeight={'500'}
                                textTransform={'uppercase'}
                                mb={'4'}>
                                Details
                            </Text>

                            <List spacing={2}>
                                <ListItem>
                                    <Text as={'span'} fontWeight={'bold'}>
                                        時間:
                                    </Text>{' '}
                                    <Box as="time" dateTime={time}>{moment(time).format('YYYY-MM-DD')}</Box>
                                </ListItem>
                                <ListItem>
                                    <Text as={'span'} fontWeight={'bold'}>
                                        地點:
                                    </Text>{' '}
                                    {location}
                                </ListItem>
                                <ListItem>
                                    <Text as={'span'} fontWeight={'bold'}>
                                        座位:
                                    </Text>{' '}
                                    {seat}
                                </ListItem>
                                <ListItem>
                                    <Text as={'span'} fontWeight={'bold'}>
                                        狀態:
                                    </Text>{' '}
                                    {(isUsed)?"已使用":"未使用"}
                                </ListItem>

                            </List>
                        </Box>
                    </Stack>

                    
                     <Button as={CustomButton} onClick={() => register({ args: [tokenId], value: price })}>登記</Button>
                     <Button  as={CustomButton}onClick={() => buy({ args: [[tokenId]], value: price })}>購買</Button>

                    <Button  as={CustomButton} onClick={() => refund({ args: [address, tokenId] })}>退款</Button>
                    <Button  as={CustomButton} onClick={onOpen}>轉賣</Button>
                    <Modal isOpen={isOpen} onClose={onClose}>
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>轉賣</ModalHeader>
                            <ModalCloseButton />
                            <Formik
                                initialValues={{
                                    price: 0,
                                    percentage:0
                                }}
                                onSubmit={(values, actions) => {
                                    list_on_marketplace({ args: [tokenId, values.price, values.percentage] })
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
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button
                                                mt={4}
                                                colorScheme='teal'
                                                //isLoading={isLoading}//{props.isSubmitting}
                                                type='submit'
                                            >
                                                轉賣
                                            </Button>
                                        </ModalFooter>
                                    </Form>
                                )}
                            </Formik>




                        </ModalContent>
                    </Modal>
                    {/* <Stack direction="row" alignItems="center" justifyContent={'center'}>
            <MdLocalShipping />
            <Text>2-3 business days delivery</Text>
          </Stack> */}
                </Stack>
            </SimpleGrid>
        </Container>
    )
}