import React, { VFC, useCallback, useState, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import fetcher from '@utils/fetcher'
import axios from 'axios'
import { Redirect, Switch, Route ,Link} from 'react-router-dom'
import { Header, RightMenu, ProfileImg, WorkspaceWrapper, Workspaces, Channels, Chats, WorkspaceName, MenuScroll,ProfileModal,LogOutButton,WorkspaceButton,WorkspaceModal,AddButton } from './styles'
import Modal from '@components/Modal'
import gravatar from 'gravatar'
import loadable from '@loadable/component';
import Menu from '@components/Menu'
import { IUser, IChannel } from '@typings/db'
import { Button, Input, Label } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput'
import {toast} from 'react-toastify'
import CreateChannelModal from '@components/CreateChannelModal'
import {useParams} from 'react-router'
import InviteWorkspaceModal from '@components/InviteWorkspaceModal'
import InviteChannelModal from '@components/InviteChannelModal'
import DMlist from '@components/DMlist/index'
import ChannelList from '@components/ChannelList'
import useSocket from '@hooks/useSocket'

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));


const Workspace: VFC = () => {

  const {workspace}= useParams<{workspace:string}>();
  const { data:userData, error, revalidate, mutate } = useSWR<IUser | false>("/api/users", fetcher)
  const { data:channelData } = useSWR<IChannel[]>(userData?`/api/workspaces/${workspace}/channels`:null, fetcher)
  const { data:memberData } = useSWR<IUser[]>(userData?`/api/workspaces/${workspace}/members`:null, fetcher)
  const [socket,disconnect]= useSocket(workspace)

  useEffect(()=>{
    console.log(socket)
    if(channelData && userData && socket ){
      socket.emit('login',{id:userData.id, channels:channelData.map((v)=>v.id)})
    }
  },[socket,userData,channelData])

  useEffect(()=>{
    return ()=>{
      disconnect();
    }
  },[workspace,disconnect])

  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false)
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false)
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false)


  const [newWorkspace,onChangeNewWorkspace,setNewWorkspace]=useInput("")
  const [newUrl,onChangeNewUrl,setNewUrl]=useInput("")
  const [showWorkspaceModal,setShowWorkspaceModal] = useState(false)
  const [showCreateChannelModal,setShowCreateChannelModal] = useState(false)

 

  const onCloseModal = useCallback(()=>{
    setShowCreateWorkspaceModal(false)
    setShowCreateChannelModal(false)
    setShowInviteChannelModal(false)
    setShowInviteWorkspaceModal(false)
  },[])
  const onCreateWorkspce = useCallback((e)=>{
    e.preventDefault();
    if(!newWorkspace || !newWorkspace.trim())return ;
    if(!newUrl|| !newUrl.trim())return ;

    axios.post("/api/workspaces",{
      workspace: newWorkspace,
      url : newUrl,
    },{withCredentials:true})
    .then(()=>{
      revalidate();
      setShowCreateWorkspaceModal(false);
      setNewUrl("")
      setNewWorkspace("")
    })
    .catch(err=>{
      console.dir(err)
      toast.error(err.response?.data, {position:'bottom-center'})
    })
      

  },[newWorkspace,newUrl])

  const onLogout = useCallback(() => {
    axios.post("/api/users/logout", null, { withCredentials: true }).then(() => {
      mutate(false, false)
    })
  }, [])

  const onClickUserProfile = useCallback((e) => {
    e.stopPropagation()
    setShowUserMenu((prev) => !prev)
  }, [])

  const onClickCreateAddSpace = useCallback(()=>{
    setShowCreateWorkspaceModal(prev=>!prev)
  },[])

  const toggleWorkspaceModal = useCallback(()=>{
    setShowWorkspaceModal((prev)=>!prev)
  },[])

  const onClickAddChannel = useCallback(()=>{
    setShowCreateChannelModal(true)
  },[])

  const onClickInviteWorkspace = useCallback(()=>{
    setShowInviteWorkspaceModal(true)
  },[])

  if (!userData) {
    return <Redirect to="/login" />
  }
  return (
    <div>
      <Header>
        <RightMenu>
          <span onClick={onClickUserProfile}>
            <ProfileImg src={gravatar.url(userData.email, { s: "28px", d: "retro" })} alt={userData.email} />
            {showUserMenu &&
              <Menu style={{ top: 38, right: 0 }} show={showUserMenu} onCloseModal={onClickUserProfile} >
                <ProfileModal>
                  <img src={gravatar.url(userData.email, { s: "28px", d: "retro" })} alt={userData.email} />
                  <div>
                    <span id="profile-name">{userData.nickname}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
              </Menu>}
          </span>
        </RightMenu>
      </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {userData?.Workspaces?.map((ws:any)=>{
            return (
              <Link key={ws.id} to={`/workspace/${13}/channel/일반`}>
                <WorkspaceButton>
                  {ws.name.slice(0,1).toUpperCase()}
                </WorkspaceButton>
              </Link>
            )})}
          <AddButton onClick={onClickCreateAddSpace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>sleact</WorkspaceName>
          <MenuScroll>
            <Menu show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal} style={{top:95 , left:80}} >
              <WorkspaceModal>
                <h2>sleact</h2>
                <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
                <button onClick={onClickAddChannel}>채널만들기</button>
                <button onClick={onLogout}>로그아웃</button>
              </WorkspaceModal>
            </Menu>
            <ChannelList/>
            <DMlist/>
          </MenuScroll>
        </Channels>
        <Chats>
          <Switch>
            <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
            <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>
      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkspce}>
          <Label id="workspace-label">
            <span>워크스페이스 이름</span>
            <Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace}/>
          </Label>
          <Label id="workspace-url-label">
            <span>워크스페이스 url</span>
            <Input id="workspace" value={newUrl} onChange={onChangeNewUrl}/>
          </Label>
          <Button type="submit">생성하기</Button>
        </form>
      </Modal>
      <CreateChannelModal show={showCreateChannelModal} 
      onCloseModal={onCloseModal} setShowCreateChannelModal={setShowCreateChannelModal}/>
      <InviteWorkspaceModal show={showInviteWorkspaceModal} onCloseModal={onCloseModal} setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}/>
      <InviteChannelModal show={showInviteChannelModal} onCloseModal={onCloseModal} setShowInviteChannelModal={setShowInviteChannelModal}/>
      
    </div>
  )
}

export default Workspace