import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender,getSenderFull } from '../config/ChatLogics';
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import './styles.css';
import animationData from '../animations/typing.json'
import ScrollableChats from './ScrollableChats';
import io from 'socket.io-client';
import Lottie from 'react-lottie';
const ENDPOINT="http://localhost:8000";
var socket,selectedChatCompare;
const SingleChat = ({fetchAgain,setFetchAgain}) => {
    const {user,selectedChat,setSelectedChat,notifications,setNotifications}=ChatState();
    const [messages,setMessages]=useState([]);
    const [loading,setLoading]=useState(false);
    const [newMessage,setNewMessage]=useState("");
    const [socketConnected,setSocketConnected]=useState(false);
    const [typing,setTyping]=useState(false);
    const [isTyping,setIsTyping]=useState(false);
    const defaultOptions={
        loop:true,
        autoplay:true,
        animationData:animationData,
        rendererSettings:{
            preserveAspectRation:"xMisYMid slice"
        }
    };
    const toast=useToast();
    const fetchMessages=async ()=>{
        if(!selectedChat){
            return;
        }
        try {
            const config={
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${user.token}`
                }
            };
            setLoading(true);
            const {data} = await axios.get(`/api/message/${selectedChat._id}`,config);
            setMessages(data);
            setLoading(false);
            socket.emit("join chat",selectedChat._id);
        } catch (error) {
            toast({
                title:"Error Occured!",
                description:"Failed to load Messages",
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom"
            });
        }
    };
    useEffect(()=>{
        socket=io(ENDPOINT);
        socket.emit("setup",user);
        socket.on("connected",()=>setSocketConnected(true));
        socket.on('typing',()=> setIsTyping(true));
        socket.on('stop typing',()=> setIsTyping(false));
    },[])
    useEffect(()=>{
        fetchMessages();
        selectedChatCompare=selectedChat;
    },[selectedChat]);
    useEffect(()=>{
        socket.on("message recieved",(newMesssageRecieved)=>{
            if(!selectedChatCompare || selectedChatCompare._id!==newMesssageRecieved.chat._id){
                if(!notifications.includes(newMesssageRecieved)){
                    setNotifications([newMesssageRecieved,...notifications]);
                    setFetchAgain(!fetchAgain);
                }
            }
            else{
                setMessages([...messages,newMesssageRecieved]);
            }
        })
    })
    const sendMessage=async (event)=>{
        if(event.key==="Enter" && newMessage.trim()){
            socket.emit('stop typing',selectedChat._id)
            try {
                const config={
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:`Bearer ${user.token}`
                    }
                };
                setNewMessage("");
                const {data}=await axios.post("/api/message",{
                    content:newMessage,
                    chatId:selectedChat._id
                },config);
                socket.emit("new message",data)
                setMessages([...messages,data])
            } catch (error) {
                toast({
                    title:"Error Occured!",
                    description:"Failed to send the Message",
                    status:"error",
                    duration:5000,
                    isClosable:true,
                    position:"bottom"
                });
                setLoading(false);
            }
        }
    }   
    
    const typingHandler=(e)=>{
        setNewMessage(e.target.value);
        if(!socketConnected){
            return;
        }
        if(!typing){
            setTyping(true);
            socket.emit('typing',selectedChat._id);
        }
        let lastTypingTime=new Date().getTime();
        var timerLength=3000;
        setTimeout(()=>{
            var timeNow=new Date().getTime();
            var timeDiff=timeNow-lastTypingTime;
            if(timeDiff>=timerLength && typing){
                socket.emit('stop typing',selectedChat._id);
                setTyping(false);
            }
        },timerLength);
    }
    return (
    <>
        {selectedChat?(
            <>
            <Text fontSize={{base:"28px",md:"30px"}} pb={3} px={2} w="100%" fontFamily="Work sans" display="flex" justifyContent={{base:"space-between"}} alignItems="center">
                <IconButton display={{base:"flex",md:"none"}} icon={<ArrowBackIcon/>} onClick={()=>setSelectedChat("")}/>
                {!selectedChat.isGroupChat && selectedChat.users && user? (
                    <>
                    {getSender(user,selectedChat.users)}
                    <ProfileModal user={getSenderFull(user,selectedChat.users)}/>
                    </>
                ):(
                    <>
                    {selectedChat.chatName.toUpperCase()}
                    <UpdateGroupChatModal fetchMessages={fetchMessages} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>

                    </>
                )}
            </Text>
            <Box display="flex" flexDir="column" justifyContent="flex-end" p={3} bg="#E8E8E8" w="100%" h="100%" borderRadius="lg" overflowY="hidden">
                {loading?(
                    <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
                ):(
                    <div className="messages">
                        <ScrollableChats messages={messages}/>
                    </div>
                )}
                <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                    {isTyping ? <div><Lottie options={defaultOptions} width={70} style={{marginBottom:15,marginLeft:0}} /></div>:<></>}
                    <Input variant="filled" bg="#E0E0E0" placeholder="Enter a message..." onChange={typingHandler} value={newMessage} />
                </FormControl>
            </Box>
            </>
        ):(
            <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                    Click on a user to start chatting 
                </Text>
            </Box>
        )} 
    </>
  )
}

export default SingleChat
