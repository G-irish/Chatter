
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Button, Tooltip, Text, Menu, MenuButton, MenuList, Avatar, MenuDivider, MenuItem, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner } from '@chakra-ui/react';
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import NotificationBadge from 'react-notification-badge';
import {Effect} from 'react-notification-badge';
const SideDrawer = () => {
  const [search, setSearch] = useState("")
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const navigate = useNavigate();
  const { user, setSelectedChat, chats, setChats, notifications, setNotifications } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  }
  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter Something in search",
        status: "warning",
        duration: 5000,
        isClosable: "true",
        position: "top-left",
      })
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      const filteredResults = data.filter((resultUser) => resultUser._id !== user._id);
      setLoading(false);
      setSearchResult(filteredResults);
    }
    catch (error) {
      toast({
        title: "Error Occured",
        description: "Failed to load the search results",
        status: "error",
        duration: 5000,
        isClosable: "true",
        position: "bottom-left",
      });
    }
  }
  const accessChat = async (userId) => {

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      // console.log(userId);
      const { data } = await axios.post("/api/chat", { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();

    }
    catch (error) {
      toast({
        title: "Error Fetching Chats",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: "true",
        position: "bottom-left",
      });
    }
  }
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" bg="white" w="100%" p="5px 10px 5px 10px" borderWidth="5px">
        <Tooltip label="Search users to chat with" hasArrow placement='bottom-end'>
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2x1" fontFamily="Work sans" >Chatters-Box</Text>
        <div>
          <Menu>
            <MenuButton p={1}><NotificationBadge count={notifications.length} effect={Effect.SCALE} /><BellIcon fontSize="2xl" m={1} /></MenuButton>
            <MenuList pl={2}>
              {!notifications.length && "No new Messages"}
              {notifications.map(notif => (
                <MenuItem key={notif._id} onClick={()=>{
                  setSelectedChat(notif.chat);
                  setNotifications(notifications.filter((n)=>n!==notif));
                }}>
                  {notif.chat.isGroupChat ? `New Message in ${notif.chat.chatName}` : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size='sm' cursor='pointer' name={user.name} src={user.pic}></Avatar>
            </MenuButton>
            <MenuList>
              <ProfileModal user={user} >
                <MenuItem>MyProfile</MenuItem>
              </ProfileModal>
              <MenuDivider></MenuDivider>
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay></DrawerOverlay>
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody >
            <Box display="flex" pb={2}>
              <Input placeholder="Search by name or email" mr={2} value={search} onChange={(e) => { setSearch(e.target.value) }}></Input>
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult.map(user => (
                <UserListItem user={user} key={user._id} handlerFunction={() => accessChat(user._id)}></UserListItem>
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

    </>
  )
}

export default SideDrawer
