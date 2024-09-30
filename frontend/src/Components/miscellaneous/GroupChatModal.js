import { Button, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure,Image, Text, useToast, FormControl, Input, Box } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import axios from "axios";
import UserListItem from '../UserAvatar/UserListItem';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
const GroupChatModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName,setGroupChatName]=useState('');
    const [selectedUsers,setSelectedUsers]=useState([]);
    const [search,setSearch]=useState();
    const [searchResult,setSearchResult]=useState([]);
    const [loading,setLoading]=useState(false);
    const toast=useToast();
    const {user,chats,setChats} =ChatState();
    // setSearchResult([user,...selectedUsers]);
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
    const handleSubmit=async ()=>{
        if(!groupChatName || !selectedUsers){
            toast({
                title:"Please fill all the details",
                status:"warning",
                duaration:5000,
                isClosable:true,
                position:"top"
            });
            return;
        }
        try {
            const config={
                headers:{
                    Authorization:`Bearer ${user.token}`,
                },
            };

            const {data}=await axios.post("/api/chat/group",
                {
                    name:groupChatName,
                    users:JSON.stringify(selectedUsers.map((u)=>u._id)),
                    
                },
                config
            );
            setChats([data,...chats]);
            onClose();
            toast({
                title:"New Group Chat has been created!",
                status:"success",
                duration:5000,
                isClosable:true,
                position:"bottom"

            })
        } catch (error) {
            toast({
                title:"Failed to create chat",
                description:error.response.data,
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom-left",
              });
        }
    }
    const handleGroup=(userToAdd)=>{
        if(selectedUsers.includes(userToAdd)){
            toast({
                title:"User already exists",
                status:"warning",
                duration:5000,
                isClosable:true,
                position:"top"
            });
            return;
        }
        setSelectedUsers([...selectedUsers,userToAdd]);
    }
    const handleDelete=(delUser)=>{
        setSelectedUsers(
            selectedUsers.filter((sel)=> sel._id !== delUser._id)
        );
    }
    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize="35px" fontFamily="Work sans" d="flex" justifyContent="center">Create Group Chat</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center">
                        <FormControl>
                            <Input placeholder="Chat Name" mb={3} onChange={(e)=> setGroupChatName(e.target.value)}></Input>
                        </FormControl>
                        <FormControl>
                            <Input placeholder="Add Users eg: John, Jane" mb={1} onChange={(e)=> handleSearch(e.target.value)}></Input>
                        </FormControl>
                        <Box w="100%" display="flex" flexDir="wrap">
                            {selectedUsers.map((u)=>(
                            <UserBadgeItem key={u._id} user={u} handleFunction={()=> handleDelete(u)}/>
                        ))}
                        </Box>
                        {loading? <div>Loading...</div> : (
                            searchResult?.slice(0,4).map((user) =>(
                                <UserListItem key={user._id} user={user} handlerFunction={()=>handleGroup(user)}/>    
                            ))
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default GroupChatModal
