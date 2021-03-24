import React ,{VFC,useState,useCallback}from 'react'
import useInput from '@hooks/useInput'
import {Label, Input, Button} from '@pages/SignUp/styles'
import Modal from '../Modal'
import axios from 'axios'
import {useParams} from 'react-router'
import { stringify } from 'node:querystring'
import {toast} from 'react-toastify'
import fetcher from '@utils/fetcher'
import useSWR from 'swr'
import {IUser,IChannel} from '@typings/db'

interface Props {
  show : boolean;
  onCloseModal:()=>void;
  setShowCreateChannelModal: (flag:boolean)=>void;
}


const CreateChannelModal : VFC<Props> =({show,onCloseModal,setShowCreateChannelModal}) => {
  const {workspace , channel} = useParams<{workspace:string; channel:string; }>();
  const { data:userData, error, revalidate, mutate } = 
  useSWR<IUser | false>("/api/users", fetcher)

  const { data:channelData ,revalidate:revalidateChannel} = useSWR<IChannel[]>(userData?`/api/workspaces/${workspace}/channels`:null, fetcher)
  const [newChannel,onChangeNewChannel,setNewChannel]=useInput("")
 

  const onCreateChannel= useCallback((e)=>{
    e.preventDefault()
    axios.post(`/api/workspaces/${workspace}/channels`,{
      name:newChannel
    },{
      withCredentials:true
    }).then(()=>{
      console.log("okok")
      revalidateChannel();
      setShowCreateChannelModal(false)
    }).catch(err=>{
      console.dir(err);
      toast.error(err.response?.data,{position: "bottom-center"})
    })
  },[newChannel])

  if(!show){
    return null
  }
  return (
    <Modal show={show} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateChannel}>
          <Label id="workspace-label">
            <span>채널 이름</span>
            <Input id="workspace" value={newChannel} onChange={onChangeNewChannel}/>
          </Label>
          <Button type="submit">생성하기</Button>
        </form>
      </Modal>
  ) 
}

export default CreateChannelModal
