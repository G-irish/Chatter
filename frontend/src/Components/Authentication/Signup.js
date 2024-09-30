import React, { useState } from 'react'
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack ,useToast} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const Signup = () => {
  const [show,toggle]=useState(false);
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [pic,setPic]=useState();
  const toast = useToast();
  const navigate=useNavigate();
  const postDetails=(pic)=>{
      setLoading(true);
      if(pic===undefined){
        toast({
          title:"Please Select an Image!",
          status:"warning",
          suration:5000,
          isClosable:true,
          position:"bottom"
        });
        return;
      }
      if(pic.type==="image/jpeg" || pic.type==="image/png"){
        const data=new FormData();
        data.append("file",pic);
        data.append("upload_preset","ChatApp");
        data.append("cloud_name","GirishM");
        fetch(process.env.CLOUDINARY_URL,{
          method:"post",
          body:data
        })
        .then((res)=> res.json())
        .then((data)=> {
          setPic(data.url.toString());
          setLoading(false);
        })
        .catch((err)=>{
          console.log(err);
          setLoading(false);
        });
      }
      else{
        toast({
          title:"Please Select an Image!",
          status:"warning",
          suration:5000,
          isClosable:true,
          position:"bottom"
        });
        setLoading(false);
        return;
      }
  }
  const handleSubmit=async ()=>{
    setLoading(true);
    if(!name || !email || !password ){
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
        "/api/user",
        {name,email,password,pic},
        config
      );
      toast({
        title:"Registration Successful",
        status:"success",
        suration:5000,
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
        <FormControl id="firstname" isRequired>
          <FormLabel>Name :</FormLabel>
          <Input placeholder='Enter Name' onChange={(e)=> setName(e.target.value)}></Input>
        </FormControl>
        <FormControl id="email" isRequired>
          <FormLabel>Email :</FormLabel>
          <Input placeholder='Enter Email' onChange={(e)=> setEmail(e.target.value)}></Input>
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Password :</FormLabel>
          <InputGroup>
          <Input type={show? "text" : "password"} placeholder='Enter Password' onChange={(e)=> setPassword(e.target.value)}></Input>
          <InputRightElement width='4.5rem'>
          <Button h='1.75rem' size='sm' onClick={()=> toggle(!show)}>
              {show? "Show" : "Hide"}
          </Button>
          </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl id='pic'>
          <FormLabel>Upload your picture...</FormLabel>
          <Input type='file' p={1.5} accept='image/*' onChange={(e)=> postDetails(e.target.files[0])}></Input>
        </FormControl>
        <Button colorScheme='blue' width='100%' style={{marginTop:15}} onClick={handleSubmit} isLoading={loading}>Submit</Button>
    </VStack>
  )
}

export default Signup
