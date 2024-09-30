
import { ViewIcon } from '@chakra-ui/icons'
import { Button, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure,Image, Text, useToast, FormControl, Input, Box, Spinner } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider'
import UserBadgeItem from '../UserAvatar/UserBadgeItem'
import axios from 'axios'
import UserListItem from '../UserAvatar/UserListItem'

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName,setGroupChatName]=useState('');
    const [search,setSearch]=useState();
    const [searchResult,setSearchResult]=useState([]);
    const [loading,setLoading]=useState(false);
    const {selectedChat,setSelectedChat,user}=ChatState();
    const toast=useToast();
    const [renameLoading,setRenameLoading]=useState(false);
    const handleAddUser=async (user1)=>{
        if(selectedChat.users.find((u)=> u._id===user1._id)){
            toast({
                title:"User Already in group!",
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom"
            });
            return;
        }
        if(selectedChat.groupAdmin._id!==user._id){
            toast({
                title:"Only admins can add someone!",
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom"
            });
            return;
        }
        try {
            setLoading(true);
            const config={
                headers:{
                    Authorization:`Bearer ${user.token}`
                }
            }
            const {data}=await axios.put('/api/chat/groupadd',{
                chatId:selectedChat._id,
                userId:user1._id,
            },config);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title:"Error Occured!",
                description:error.response.data.message,
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom"
            });
        }
    }
    const handleRemove=async(user1)=>{
        if(selectedChat.groupAdmin._id!==user._id && user1._id !==user._id){
            toast({
                title:"Only admins can remove someone!",
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom"
            });
            return;
        }
        try {
            setLoading(true);
            const config={
                headers:{
                    Authorization:`Bearer ${user.token}`
                }
            }
            const {data}=await axios.put('/api/chat/groupremove',{
                chatId:selectedChat._id,
                userId:user1._id,
            },config);
            user1._id===user._id ? setSelectedChat() : setSelectedChat(data); 
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title:"Error Occured!",
                description:error.response.data.message,
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom"
            });
        }
    }
    const handleRename=async ()=>{
        if(!groupChatName){
            return;
        }
        try {
            setRenameLoading(true);
            const config={
                headers:{
                    Authorization:`Bearer ${user.token}`
                }
            }
            const {data}=await axios.put("/api/chat/rename",{
                chatId:selectedChat._id,
                chatName:groupChatName
            },config);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
        } catch (error) {
            toast({
                title:"Error Occured!",
                description:error.response.data.message,
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom"
            });
            setRenameLoading(false);
        }
    }
    const handleSearch=async (query)=>{
        setSearch(query);
        if(!query){
            return ;
        }
        try {
            setLoading(true);
            const config={
                headers:{
                    Authorization:`Bearer ${user.token}`
                },
            };
            const {data}=await axios.get(`/api/user?search=${search}`,config);
            const filteredResults = data.filter((resultUser) => resultUser._id !== user._id);
            setLoading(false);
            setSearchResult(filteredResults);
        } catch (error) {
            toast({
                title:"Error Occured",
                description:"Failed to load the search results",
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom-left",
              });
        }
    }
    
    return (
        <>
            <IconButton display={{base:"flex"}} icon={<ViewIcon/>} onClick={onOpen}>Open Modal</IconButton>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selectedChat.chatName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                            {selectedChat.users.map((u)=>(
                                <UserBadgeItem key={u._id} user={u} handleFunction={()=>{handleRemove(u)}} />
                            ))}
                        </Box>
                        <FormControl display="flex">
                            <Input placeholder="Chat Name" mb={3} value={groupChatName} onChange={(e)=>setGroupChatName(e.target.value)}/>
                            <Button variant="solid" colorScheme="teal" ml={1} isLoading={renameLoading} onClick={handleRename}>Update</Button>
                        </FormControl>
                        <FormControl>
                            <Input placeholder="Add User to group" mb={1} onChange={(e)=> handleSearch(e.target.value)} />
                        </FormControl>
                        {loading?(
                            <Spinner size="lg"/>
                        ):(
                            searchResult?.map((u)=>(
                                <UserListItem key={u._id} user={u} handlerFunction={()=>handleAddUser(u)}/>
                            ))
                        )}
                    </ModalBody>

                    <ModalFooter display="flex" justifyContent="space-between" width="100%">
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button colorScheme="red" onClick={()=>handleRemove(user)}>
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default UpdateGroupChatModal
