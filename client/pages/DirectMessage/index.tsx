import React,{useCallback} from 'react'
import {Container,Header} from '@pages/DirectMessage/styles'
import gravatar from 'gravatar'
import useSWR from 'swr'
import {useParams} from 'react-router'
import fetcher from '@utils/fetcher'
import ChatBox from '@components/ChatBox'
import ChatList from '@components/ChatList'
import useInput from '@hooks/useInput'
import axios from 'axios'


const DirectMessage = ()=>{
  const {workspace,id} = useParams<{workspace:string , id:string}>();
  const {data:userData} = useSWR(`/api/workspaces/${workspace}/users/${id}`,fetcher)
  const {data:chatData,revalidate} = useSWR(`/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,fetcher)
  
  const {data:myData} = useSWR(`/api/users`,fetcher)

  const [chat, onChangeChat,setChat] = useInput("")

  const onSubmitForm = useCallback((e)=>{
    e.preventDefault();
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

  if(!userData||!myData){
    return null;
  }

  return (
      <Container>
        <Header>
          <img src={gravatar.url(userData.email,{s:"24px",d:"retro"})} alt=""/>
          <span>{userData.nickname}</span>
        </Header>
        <ChatList chatData={chatData}/>
        <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
      </Container>
  )
}

export default DirectMessage