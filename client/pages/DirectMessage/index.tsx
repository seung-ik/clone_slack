import React,{useCallback, useEffect, useRef} from 'react'
import {Container,Header} from '@pages/DirectMessage/styles'
import gravatar from 'gravatar'
import useSWR, { useSWRInfinite } from 'swr'
import {useParams} from 'react-router'
import fetcher from '@utils/fetcher'
import ChatBox from '@components/ChatBox'
import ChatList from '@components/ChatList'
import useInput from '@hooks/useInput'
import axios from 'axios'
import makeSection from '@utils/makeSection'
import {Scrollbars} from 'react-custom-scrollbars'
import { IDM } from '@typings/db'
import useSocket from '@hooks/useSocket'


const DirectMessage = ()=>{
  const {workspace,id} = useParams<{workspace:string , id:string}>();
  const {data:userData} = useSWR(`/api/workspaces/${workspace}/users/${id}`,fetcher)

  const {data:chatData, revalidate, mutate: mutateChat, setSize} = useSWRInfinite<IDM[]>(
    (index)=>`/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index+1}`,fetcher,{
      onSuccess(data) {
        if (data?.length === 1) {
          setTimeout(() => {
            scrollbarRef.current?.scrollToBottom();
          }, 100);
        }
      },
    },
  )
  
  const [socket] = useSocket()
  const isEmpty = chatData?.[0]?.length === 0; 
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length-1]?.length<20) || false
  const {data:myData} = useSWR(`/api/users`,fetcher)
  const [chat, onChangeChat,setChat] = useInput("")
  const scrollbarRef =useRef<Scrollbars>(null);

  // 새로운거 로딩시에 스크롤 맨아래로 이동
  useEffect(()=>{
    if(chatData?.length===1){
      scrollbarRef.current?.scrollToBottom()
    }
  },[chatData])

  const onMessage = useCallback((data: IDM) => {
    // id는 상대방 아이디
    if (data.SenderId === Number(id) && myData.id !== Number(id)) {
      mutateChat((chatData) => {
        chatData?.[0].unshift(data);
        return chatData;
      }, false).then(() => {
        if (scrollbarRef.current) {
          if (
            scrollbarRef.current.getScrollHeight() <
            scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
          ) {
            console.log('scrollToBottom!', scrollbarRef.current?.getValues());
            setTimeout(() => {
              scrollbarRef.current?.scrollToBottom();
            }, 50);
          }
        }
      });
    }
  }, []);

  useEffect(()=>{
    socket?.on("dm",onMessage)
    return ()=>{
      socket?.off('dm',onMessage)
    }
  },[socket,onMessage])
  
  const onSubmitForm = useCallback((e)=>{
    e.preventDefault();
    if(chat?.trim() && chatData){
      const savedChat = chat;
      console.log(chat,"durl",chatData)
      mutateChat((prevChatData)=>{
        prevChatData?.[0].unshift({
          id:(chatData[0][0]?.id+1),
          content : savedChat,
          SenderId : myData.id,
          Sender:myData,
          ReceiverId : userData.id,
          Receiver:userData,
          createdAt:new Date()
        });
        return prevChatData
      },false)
        .then(()=>{
          setChat("")
          scrollbarRef.current?.scrollToBottom()
        })
      axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`,{
        content:chat,
      },{
        withCredentials:true
      }).then(()=>{
        revalidate();
      }).catch(err=>console.error)
    }
    setChat('')
  },[chat, chatData, myData,workspace,id,userData])

  if(!userData||!myData){
    return null;
  }

  
  const chatSections = makeSection(chatData ? ([] as IDM[]).concat(...chatData).reverse() : []);

  return (
      <Container>
        <Header>
          <img src={gravatar.url(userData.email,{s:"24px",d:"retro"})} alt=""/>
          <span>{userData.nickname}</span>
        </Header>
        <ChatList 
          chatSections={chatSections} 
          scrollbarRef={scrollbarRef} 
          setSize={setSize}
          isEmpty={isEmpty}
          isReachingEnd={isReachingEnd} />
        <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
      </Container>
  )
}

export default DirectMessage