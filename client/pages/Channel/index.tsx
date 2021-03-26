import React,{useCallback} from 'react'
import {Header , Container} from "./styles"
import ChatList from '@components/ChatList'
import ChatBox from '@components/ChatBox'
import useInput from '@hooks/useInput'
import axios from 'axios'
import { useParams } from 'react-router'
import fetcher from '@utils/fetcher'
import useSWR from 'swr'
import {IUser,IDM} from '@typings/db'


const Channel = ()=>{
  const {workspace,id} =useParams<{workspace:string,id:string}>();
  const { data:userData} = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher)
  const { data:myData } = useSWR("/api/users", fetcher)
  const [chat,onChangeChat,setChat] = useInput("");
  const { data:chatData, mutate:mutateChat, revalidate } = useSWR<IDM[]>(userData?`/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`:null, fetcher)
  
  const onSubmitForm = useCallback((e)=>{
    e.preventDefault();
    console.log(chat)
    if(chat?.trim()){
      axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`,{
        content:chat,
      },{
        withCredentials:true
      }).then(()=>{
        revalidate();
        setChat("")
      }).catch(err=>console.error(err))
    }
    setChat('')
  },[chat, chatData, myData,workspace])
  return (
    <Container>
      <Header>ㅊㅐ널!</Header>
      <ChatList chatData={chatData}></ChatList>
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}></ChatBox>
    </Container>
  )
}

export default Channel