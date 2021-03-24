import React from 'react'
import {Container,Header} from '@pages/DirectMessage/styles'
import gravatar from 'gravatar'
import useSWR from 'swr'
import {useParams} from 'react-router'
import fetcher from '@utils/fetcher'
import ChatBox from '@components/ChatBox'
import ChatList from '@components/ChatList'


const DirectMessage = ()=>{
  const {workspace,id} = useParams<{workspace:string , id:string}>();
  const {data:userData} = useSWR(`/api/workspaces/${workspace}/users/${id}`,fetcher)
  const {data:myData} = useSWR(`/api/users`,fetcher)

  if(!userData||!myData){
    return null;
  }

  return (
      <Container>
        <Header>
          <img src={gravatar.url(userData.email,{s:"24px",d:"retro"})} alt=""/>
          <span>{userData.nickname}</span>
        </Header>
        <ChatList/>
        <ChatBox chat=""/>
      </Container>
  )
}

export default DirectMessage