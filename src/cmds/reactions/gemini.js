'use strict'
const rabbitmq = require('src/rabbitmq')
const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({});

const getResponse = async( message )=>{
  if(!message) return
  let response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: message,
  });
  return response?.text
}
module.exports = async(msg = {}, botIDs = [], botPingMsg)=>{
  let array = msg?.content?.split(' '), msg2send
  
  if(array?.length == 1 && botPingMsg && array?.filter(x=>x.includes('<@'))?.length == 1){
    msg2send = botPingMsg
  }else{
    let content = array.filter(x=>!x.includes('<@'))?.join(' ')
    if(content) msg2send = await getResponse(content);
  }
  if(msg2send) rabbitmq.notify({ cmd: 'POST', sId: msg.sId, chId: msg.chId, msg: msg2send, msgId: msg.id, podName: msg.podName }, msg.podName, 'bot.msg')
}
