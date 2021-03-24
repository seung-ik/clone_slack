import React,{useState,useCallback} from 'react'
import useInput from '@hooks/useInput';
import { Header, Form,Label, Input, Button, Error, LinkContainer} from "@pages/SignUp/styles"
import {Link, Redirect} from 'react-router-dom'
import axios from 'axios'
import useSWR from 'swr'
import fetcher from '@utils/fetcher'


const LogIn = () => {
  const {data,error,revalidate,mutate}=useSWR("/api/users",fetcher)
  const [email,onChangeEmail,setEmail] = useInput("")
  const [password,onChangePassword,setPassword] = useInput("")
  const [logInError,setLogInError]=useState(false)

  const onSubmit = useCallback((e)=>{
    e.preventDefault();
    setLogInError(false)
    axios.post(
      "/api/users/login",{
        email,password
      },{withCredentials:true}
    ).then(res=>{
      mutate(res.data,false)
    }).catch(err=>
      setLogInError(err.response?.data?.statusCode===401)
      )
  },[email,password])
  if(data===undefined){
    return <div>로딩중</div> 
  }

  if(data){
    
    return <Redirect to="/workspace/sleact/channel/일반"/> 
  }

  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
          {logInError && <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link to="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default LogIn;
