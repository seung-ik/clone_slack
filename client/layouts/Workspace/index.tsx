import React, { FC, useCallback, useState } from 'react'
import useSWR, { mutate } from 'swr'
import fetcher from '@utils/fetcher'
import axios from 'axios'
import { Redirect, Switch, Route ,Link} from 'react-router-dom'
import { Header, RightMenu, ProfileImg, WorkspaceWrapper, Workspaces, Channels, Chats, WorkspaceName, MenuScroll,ProfileModal,LogOutButton,WorkspaceButton,AddButton } from './styles'
import Modal from '@components/Modal'
import gravatar from 'gravatar'
import loadable from '@loadable/component';
import Menu from '@components/Menu'
import { IUser } from '@typings/db'
import { Button, Input, Label } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput'
import {toast} from 'react-toastify'

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));


const Workspace: FC = ({ children }) => {

  const { data:userData, error, revalidate, mutate } = useSWR<IUser | false>("http://localhost:3095/api/users", fetcher)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false)

  const [newWorkspace,onChangeNewWorkspace,setNewWorkspace]=useInput("")
  const [newUrl,onChangeNewUrl,setNewUrl]=useInput("")

  const onCloseModal = useCallback(()=>{
    setShowCreateWorkspaceModal(false)
  },[])
  const onCreateWorkspce = useCallback((e)=>{
    e.preventDefault();
    if(!newWorkspace || !newWorkspace.trim())return ;
    if(!newUrl|| !newUrl.trim())return ;

    axios.post("http://localhost:3095/api/workspaces",{
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
    axios.post("http://localhost:3095/api/users/logout", null, { withCredentials: true }).then(() => {
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
          {userData?.Workspaces.map((ws:any)=>{
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
          <WorkspaceName>sleact</WorkspaceName>
          <MenuScroll>
            menuscroll
          </MenuScroll>
        </Channels>
        <Chats>
          <Switch>
            <Route path="/workspace/dm" component={DirectMessage} />
            <Route path="/workspace/channel" component={Channel} />
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
    </div>
  )
}

export default Workspace