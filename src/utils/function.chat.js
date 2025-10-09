import axios from "axios"
import app from '@/config'





const getAllChatByIdSeller = async (id)=>{
 const res = await axios.post(`${app.baseURL.replace(/\/$/, '')}/getchats`, {id});
 console.log(res);
 
} 

 const creatChat = async (data) => {
     const res = await axios.post(`${app.baseURL.replace(/\/$/, '')}/chat/create`, { data });
     console.log(res);
 };

export { getAllChatByIdSeller, creatChat };