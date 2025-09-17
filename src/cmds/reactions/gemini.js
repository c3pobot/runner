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

  if(array?.length == 1 && botPingMsg && !msg.reference){
    msg2send = botPingMsg
  }else{
    for(let i in botIDs){
      array = array.filter(x=>!x.includes(botIDs[i]))
    }
    let content = array.join(' ')
    if(content) msg2send = await getResponse(content);
  }
  if(msg2send) rabbitmq.notify({ cmd: 'POST', sId: msg.sId, chId: msg.chId, msg: msg2send, msgId: msg.id, podName: msg.podName }, msg.podName, 'bot.msg')
}
