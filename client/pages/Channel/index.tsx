import React,{useCallback, useEffect, useRef, useState} from 'react'
import {Header , Container} from "./styles"
import ChatList from '@components/ChatList'
import ChatBox from '@components/ChatBox'
import useInput from '@hooks/useInput'
import axios from 'axios'
import { useParams } from 'react-router'
import fetcher from '@utils/fetcher'
import useSWR, { useSWRInfinite } from 'swr'
import {IUser,IChat, IChannel} from '@typings/db'
import makeSection from '@utils/makeSection'
import Scrollbars from 'react-custom-scrollbars'
import useSocket from '@hooks/useSocket'
import InviteChannelModal from '@components/InviteChannelModal'


const Channel = ()=>{
  const {workspace,channel} = useParams<{workspace:string , channel:string}>();
  const {data:myData} = useSWR(`/api/users`,fetcher)
  const {data:channelMembersData} = useSWR<IUser[]>(myData ? `/api/workspaces/${workspace}/channels/${channel}/members`:null,fetcher)
  const {data:channelData} = useSWR<IChannel>(`/api/workspaces/${workspace}/channels/${channel}`)

  const {data:chatData, revalidate, mutate: mutateChat, setSize} = useSWRInfinite<IChat[]>(
    (index)=>`/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index+1}`,fetcher,{
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
  const [chat, onChangeChat,setChat] = useInput("")
  const scrollbarRef =useRef<Scrollbars>(null);
  const [showInviteChannelModal,setShowInviteChannelModal]=useState(false)

  // 새로운거 로딩시에 스크롤 맨아래로 이동
  useEffect(()=>{
    if(chatData?.length===1){
      scrollbarRef.current?.scrollToBottom()
    }
  },[chatData])

  const onMessage = useCallback((data: IChat) => {
    // id는 상대방 아이디
    if (data.Channel.name === channel && myData.id !== data.User.id) {
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
  }, [channel]);

  useEffect(()=>{
    socket?.on("message",onMessage)
    return ()=>{
      socket?.off('message',onMessage)
    }
  },[socket,onMessage])
  
  const onSubmitForm = useCallback((e)=>{
    e.preventDefault();
    if(chat?.trim() && chatData && channelData){
      const savedChat = chat;
      console.log(chat,"durl",chatData)
      mutateChat((prevChatData)=>{
        prevChatData?.[0].unshift({
          id:(chatData[0][0]?.id+1),
          content : savedChat,
          UserId:myData.id,
          User:myData,
          ChannelId: channelData.id,
          Channel:channelData,
          createdAt:new Date()
        });
        return prevChatData
      },false)
        .then(()=>{
          setChat("")
          scrollbarRef.current?.scrollToBottom()
        })
      axios.post(`/api/workspaces/${workspace}/channels/${channel}/chats`,{
        content:chat,
      },{
        withCredentials:true
      }).then(()=>{
        revalidate();
      }).catch(err=>console.error)
    }
    setChat('')
  },[chat, chatData, myData,workspace,channelData,channel])

  const onClickInviteChannel = useCallback(()=>{
    setShowInviteChannelModal(true)
  },[])

  const onCloseModal = useCallback(()=>{
    setShowInviteChannelModal(false)
  },[])

  if(!myData){
    return null;
  }

  
  const chatSections = makeSection(chatData ? ([] as IChat[]).concat(...chatData).reverse() : []);

  return (
      <Container>
        <Header>
          <span>#{channel}</span>
          <div className="header-right">
          <span>{channelMembersData?.length}</span>
          <button
            onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
          >
            <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
          </button>
        </div>
        </Header>
        <ChatList 
          chatSections={chatSections} 
          scrollbarRef={scrollbarRef} 
          setSize={setSize}
          isEmpty={isEmpty}
          isReachingEnd={isReachingEnd} />
        <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
        <InviteChannelModal 
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}/>

        
      </Container>

  )
}

export default Channel