import React ,{ FC,useCallback}from 'react'
import useSWR, { mutate } from 'swr'
import fetcher from '@utils/fetcher'
import axios from 'axios'
import {Redirect} from 'react-router-dom'
import {Header,RightMenu,ProfileImg,WorkspaceWrapper,Workspaces,Channels,Chats,WorkspaceName,MenuScroll} from './styles'
import gravatar from 'gravatar'


const Workspace: FC = ({children})=>{
  const {data,error,revalidate,mutate}=useSWR("http://localhost:3095/api/users",fetcher)


  const onLogout = useCallback(()=>{
    axios.post("http://localhost:3095/api/users/logout",null,{withCredentials:true}).then(()=>{
      mutate(false,false)
    })
  },[])

  if(!data){
    return <Redirect to="/login"/>
  }
  return (
    <div>
      <Header>
        <RightMenu>
          <span>
          <ProfileImg src={gravatar.url(data.email,{s:"28px",d:"retro"})} alt={data.email}/>
          </span>
        </RightMenu>
      </Header>
      <button onClick={onLogout}>로그아웃</button>
      <WorkspaceWrapper>
        <Workspaces>test</Workspaces>
        <Channels>
          <WorkspaceName>sleact</WorkspaceName>
          <MenuScroll>
            menuscroll
          </MenuScroll>
        </Channels>
        <Chats>챗</Chats>
      </WorkspaceWrapper>
      {children}
    </div>
  )
}

export default Workspace