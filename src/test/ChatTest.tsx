import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { Socket,io } from 'socket.io-client';
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

type Message = {
  room:string;
  message:string;
  sender:string;
}
const ChatTest = () => {
  const {room}= useParams()
  const [socket,setSocket] = useState<Socket>()
  const [message,setMessage] = useState<string>('')
  const [messages,setMessages] = useState<Message[]>([])

  const user = useSelector((state: RootState) => state.user.user);
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  
  const joinRoom = ()=>{
    if(!socket) return
    socket.emit('join_room',{
      room:room,
      sender:user?.name,
      message:''
    })
  }
  
  useEffect(()=>{
    setSocket(io('https://localhost:3000',{
      transports:['websocket']
    }))

    return ()=>{
      if(socket) socket.disconnect()
    }
  },[])

  useEffect(()=>{
    if(!socket) return
    socket.on('message',(message)=>{
      setMessages((prev)=>[...prev,message])
    })
    joinRoom()
  },[socket])

  const handleSendMessage = ()=>{
    if(!socket) return
    socket.emit('message',{room,message,sender:user?.name})
    
    setMessage('')
  }
  
  const handleLeaveRoom = ()=>{
    if(!socket) {
      window.location.href = '/'
      return
    }
    socket.emit('leave_room',room)
    socket.disconnect()
    setTimeout(() => {
      // 위에 emit이랑 disconnect가 비동기 작업이지만, promise객체를 반환하지 않아서,
      // await을 사용할 수 없다. 그래서 window.location.href를 비동기로 만들어서 
      // 소켓을 끊기 전에 메인으로 가는 상황을 방지했다.
      window.location.href = '/'  
    }, 0);
    
  }
  return (
    <div style={{backgroundColor:'white'}}>
      <h1>현재 방: {room}</h1>
      <button onClick={handleLeaveRoom}>방 나가기</button>
      <input type="text" value={message} onChange={(e)=>setMessage(e.target.value)} />
      <button onClick={handleSendMessage}>메시지 보내기</button>
      <ul>
        {messages.map((message,index)=>(
          <li key={index}>{message.sender}: {message.message}</li>
        ))}
      </ul>
    </div>
  )
}

export default ChatTest