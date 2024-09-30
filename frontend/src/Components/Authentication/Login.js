import React, { useState } from 'react'
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack ,useToast} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const Login = () => {
  const [show,toggle]=useState(false);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const toast = useToast();
  const navigate=useNavigate();
  const handleSubmit=async ()=>{
    setLoading(true);
    if( !email || !password ){
      toast({
        title:"Please Fill all Feilds",
        status:"warning",
        suration:5000,
        isClosable:true,
        position:"bottom"
      });
      setLoading(false);
      return;
    }
    try{
      const config={
        headers:{
          "Content-type":"application/json"
        },
      };
      const{data}=await axios.post(
        "/api/user/login",
        {email,password},
        config
      );
      toast({
        title:"Login Successful",
        status:"success",
        duration:5000,
        isClosable:true,
        position:"bottom"
      });
      localStorage.setItem("userInfo",JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    }catch(err){
      toast({
        title:"Error Occured",
        status:"error",
        suration:5000,
        isClosable:true,
        position:"bottom"
      });
      setLoading(false);
    }
  }
  return (
    <VStack spacing='5px' >
        <FormControl id="email" isRequired>
          <FormLabel>Email :</FormLabel>
          <Input value={email} placeholder='Enter Email' onChange={(e)=> setEmail(e.target.value)}></Input>
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Password :</FormLabel>
          <InputGroup>
          <Input value={password} type={show? "text" : "password"} placeholder='Enter Password' onChange={(e)=> setPassword(e.target.value)}></Input>
          <InputRightElement width='4.5rem'>
          <Button h='1.75rem' size='sm' onClick={()=> toggle(!show)}>
              {show? "Show" : "Hide"}
          </Button>
          </InputRightElement>
          </InputGroup>
        </FormControl>
        <Button colorScheme='blue' width='100%' style={{marginTop:15}} onClick={handleSubmit} isLoading={loading}>Submit</Button>
        <Button variant="solid" colorScheme='red' width="100%" onClick={()=>{setEmail("guest@example.com"); setPassword("123456");}}>Get Guest User Credentails</Button>
    </VStack>
  )
}

export default Login
