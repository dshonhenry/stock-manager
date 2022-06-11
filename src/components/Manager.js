import { Box, Select, Input, Table, Thead, Tbody, Tr, Td, Th, Button, HStack, Heading,Popover, PopoverTrigger, PopoverContent,PopoverArrow, PopoverBody, PopoverHeader, PopoverCloseButton, ButtonGroup, Menu, MenuButton,MenuList, MenuItem, Flex, useToast } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import {VscFilePdf} from 'react-icons/vsc'
import {FaFilter} from 'react-icons/fa'

const Manager = () => {
    const [stock, setStock] = useState(window.api.getStock());
    const [filteredStock, setFilteredStock] = useState([]);
    const [filter, setFilter] = useState('misc')
    const [type, setType] = useState('misc')
    const searchRef = useRef();
    const toast = useToast();

    const scrollbarStyle = {
        '::-webkit-scrollbar': {
            width: '20px'
          },
          
          '::-webkit-scrollbar-track' :{
            'background-color': 'transparent'
          },
          
          '::-webkit-scrollbar-thumb' :{
            'background-color': '#d6dee1',
            'border-radius': '20px',
            border: '6px solid transparent',
            'background-clip': 'content-box',
          }
    }

    const search = () => {
        setFilteredStock(stock[filter].filter(item => item.name.toLowerCase().includes(searchRef.current.value)))
    }

    const save = (id, column, value) => {
        const index = stock[filter].findIndex((item)=> item.id === id)
        let updatedStock = {...stock};
        updatedStock[filter][index][column] = value;
        setStock(updatedStock);
    }

    const exportData = (e) => {
        window.api.exportData()
    }

    const importData = (e) => {
        if(window.api.importData()) {
            toast({
                title: `Data Imported`,
                status: 'success',
                isClosable: true,
                duration: 1000,
            })
            setStock(window.api.getStock())
        }
        else {
            toast({
                title: `Import Error`,
                description: 'There was a problem importing the file',
                status: 'error',
                isClosable: true,
                duration: 1000,
            })
        }

    }

    const addItem = (e) => {
        e.preventDefault();
        let newId = window.api.getId();
        const newItem = {
            id: newId,
            name: e.target[0].value,
            price: parseFloat(e.target[1].value),
            inStore: parseInt(e.target[2].value),
            inStorage: parseInt(e.target[3].value),
        }
        if(type==='powders') newItem.weight = e.target[4].value
        setStock(stock => ({...stock, [type]: [...stock[type], newItem]}))
        e.target.reset()
    }

    const removeItem = (id) => {
        setStock(stock=>({...stock, [filter]: stock[filter].filter(item=>item.id!==id)}))
    }

    const filterFunction = (newFilter) => {
        if(newFilter === filter) return;
        setFilter(newFilter)
            
    }
    useEffect(()=>{
        search()
    },[filter])

    useEffect(()=> {
        search()
        window.api.updateStockFile(stock)
    }, [stock])

    return (
        <Flex width='100%' gap={8} pt={6} px={10} minW="850px" height='100vh' direction='column'>
            <Heading>Inventory Manager</Heading>
            <HStack as="form" onSubmit={addItem}>
                <Input size='sm' w='200px' placeholder="Item" name="name" required></Input>
                <Input size='sm' w='150px' type='currency' placeholder="Price" name="price" required></Input>
                <Input size='sm' w='150px' type='number' placeholder="Amount In Store" name="inStore" required></Input>
                <Input size='sm' w='150px' type='number' placeholder="Amount In Storage" name="inStorage" required></Input>
                { type === 'powders' && <Input size='sm' w='150px' type='number' placeholder="Weight" name="weight" required></Input>}
                <Select size='sm' w='150px' name='type' onChange={e=>setType(e.target.value)} value={type}>
                    <option value='misc'>Misc</option>
                    <option value='snacks'>Snacks</option>
                    <option value='powders'>Powders</option>
                </Select>
                <Button type="submit" size='sm' colorScheme='telegram'>Add Item</Button>
                <Button size='sm' colorScheme='telegram' variant='outline' onClick = {importData}>Import</Button>
                <Button size='sm' colorScheme='telegram' variant='outline' onClick = {exportData}>Export</Button>
            </HStack>
            <Flex justifyContent='space-between'>
                <HStack w='900px'>
                    <Input placeholder="Search for Item" w='400px' onChange={e => search()} ref={searchRef}></Input> 
                    <Menu colorScheme='telegram'>
                        <MenuButton as={Button} rightIcon={<FaFilter />} variant='outline' colorScheme='telegram'>
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </MenuButton>
                        <MenuList zIndex={200}>
                            <MenuItem onClick={e=>filterFunction('snacks')}>Snacks</MenuItem>
                            <MenuItem onClick={e=>filterFunction('powders')}>Powders</MenuItem>
                            <MenuItem onClick={e=>filterFunction('misc')}>Misc</MenuItem>
                        </MenuList>
                        </Menu>
                </HStack>
                <Button rightIcon={<VscFilePdf/>} onClick={e=>window.api.savePDF()} colorScheme='telegram' variant='outline'> Create PDF </Button>
            </Flex>

            <Box overflowY='auto' flex={1}  __css={scrollbarStyle}>
            <Table size='md'>
                <Thead position='sticky' top={0} bg='white' zIndex={10}>
                    <Tr>
                        <Th>Item</Th>
                        <Th>Price($)</Th>
                        {filter==="powders" && <Th>Weight</Th>}
                        <Th>In Store</Th>
                        <Th>In Storage</Th>
                        <Th></Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {filteredStock.map(item=>(
                        <Tr key={item.id}>
                            <Td>{item.name}</Td>
                            <Td >{item.price.toFixed(2)}</Td>
                            {filter==="powders" && <Td>{item.weight}</Td>}
                            <Td ><Input type='number' defaultValue={item.inStore} w='100px' onBlur={e=>save(item.id, "inStore", e.target.value)}></Input></Td>
                            <Td ><Input type='number' defaultValue={item.inStorage} w='100px' onBlur={e=>save(item.id, "inStorage", e.target.value)}></Input></Td>
                            <Td>
                                <Popover>
                                {({ isOpen, onClose }) => (
                                    <>
                                        <PopoverTrigger>
                                            <Button>Remove</Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverHeader>Confirmation!</PopoverHeader>
                                            <PopoverBody>
                                                Are you sure you want to remove this item? <br/>
                                                <ButtonGroup justifyContent='flex-end' width='100%'>
                                                    <Button colorScheme='telegram' onClick={e=>{removeItem(item.id); onClose(e)}}>Yes</Button>
                                                    <Button onClick={onClose}> No</Button>
                                                </ButtonGroup>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </>
                                )}
                                </Popover>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            </Box>

        </Flex>
    )
}

export default Manager;