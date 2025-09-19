'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const rabbitmq = require('src/rabbitmq')
const { GoogleGenAI } = require("@google/genai")

let defend = new Set([]), rude = new Set([])
const ai = new GoogleGenAI({});
const truncateString = (str, maxLength) => {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 3) + '...'; // -3 for the ellipsis
  }
  return str;
}
const getPrompt = (author, content, defendOthers, attackOthers, rudeUser)=>{
  let prompt = `You are a smart-ass, witty Discord bot.
  RULES:
  - Keep it punchy; prefer under ~300 words unless extra detail is needed for correctness.
  - NEVER use slur/hate toward protected classes and NEVER encourage violence.`

  if(rudeUser){
    prompt += `\n  - Reply with a short, witty roast and do NOT provide help`
  }else{
    if(attackOthers){
      prompt += `\n  - Attack mentioned persons.`
    }else{
      if(defendOthers){
        prompt += `\n  - Defend mentioned persons honor`
      }else{
        prompt += `\n  - If the user's latest message is a genuine question or asks for help -> give a correct, practical answer with a snarky edge.`
        prompt += `\n  - If the user's latest message is primarly insults/taunting/bad-faith -> reply with a short, witty roast and do NOT provide help.`
        prompt += `\n  - If it's casual banter -> be playful and brief.`
      }
    }
  }
  prompt += `\nLatest user:
  User: ${author}
  Message: "${content}"

  Respond now in one message, following the rules above.`
  return prompt?.trim()
}
const getResponse = async( message, model )=>{
  try{
    if(!message) return
    let response = await ai.models.generateContent({
      model: model,
      contents: message,
    });
    return response?.text
  }catch(e){
    log.error(model)
    log.error(e)
    if(e?.status == 503) return e.status
  }
}
const getResponseRetry = async(message, retry = true)=>{
  try{
    let model = "gemini-2.5-flash"
    if(!retry) model = "gemini-2.5-flash-lite"
    let res = await getResponse(message, model)
    if(res == 503 && retry) return await getResponseRetry(message, false)
    return res
  }catch(e){
    log.error(e)
  }
}
const sync = async()=>{
  try{
    let status = mongo.status()
    if(status){
      let botSettings = (await mongo.find('botSettings', { _id: 'gemini' }))[0]
      if(botSettings?._id){
        defend = new Set(botSettings.defend || [])
        rude = new Set(botSettings.rude || [])
      }

      setTimeout(sync, 10000)
    }else{
      setTimeout(sync, 2000)
    }
  }catch(e){
    log.error(e)
    setTimeout(sync, 5000)
  }
}
sync()
const swapIdForName = (mentions = [], content = [])=>{
  for(let i in mentions){
    for(let a in content){
      if(content[a].includes(mentions[i].id)) content[a] = `@${mentions[i].name}`
    }
  }
}
const getMention = (id, type = 'user')=>{
  if(!id) return
  let str = `<@`
  if(type == 'role') str += '&'
  str += `${id}>`
  return str
}
const swapNameForId = (mentions = [], content = [], type = 'user')=>{
  for(let i in mentions){
    for(let a in content){
      if(content[a].includes(`@${mentions[i].name}`)) content[a] = getMention(mentions[i].id, type)
    }
  }
}
const pruneHistory = (history = []) =>{
  let i = +(history.length || 0) - 5000
  if(0 >= i) return
  while(i > 0){
    history.shift()
    i--;
  }

}
module.exports = async(msg = {}, botIDs = [], botPingMsg)=>{
  let history = (await mongo.find('aiHistory', { _id: msg.dId }))[0]?.history || []
  if(history?.length > 5000) pruneHistory(history)
  let array = msg?.content?.split(' '), msg2send, tempMsg
  let rudeUser, defendMention, attackMention
  if(rude.has(msg.dId)) rudeUser = true
  for(let i in msg.userMentions){
    if(rude.has(msg.userMentions[i])) attackMention = true
    if(defend.has(msg.userMentions[i])) defendMention = true
  }
  if(array?.length == 1 && botPingMsg && !msg.reference){
    msg2send = botPingMsg
  }else{
    for(let i in botIDs){
      array = array.filter(x=>!x.includes(botIDs[i]))
    }
    swapIdForName(msg.userMentions, array)
    swapIdForName(msg.roleMentions, array)
    let content = array.join(' ')
    if(content){
      history.push({ role: 'user', parts: [{ text: getPrompt(`@${msg.username}`, content, defendMention, attackMention, rudeUser) }]})
      tempMsg = await getResponseRetry(history);
    }
    if(tempMsg){
      tempMsg = tempMsg.split(' ')
      swapNameForId(msg.userMentions, tempMsg, 'user')
      swapNameForId(msg.roleMentions, tempMsg, 'role')
      msg2send = tempMsg.join(' ')
      history.push({ role: 'model', parts: [{ text: msg2send }]})
      await mongo.set('aiHistory', { _id: msg.dId }, { history: history })
    }
  }
  if(msg2send) rabbitmq.notify({ cmd: 'POST', sId: msg.sId, chId: msg.chId, msg: truncateString(msg2send, 2000), msgId: msg.id, podName: msg.podName }, msg.podName, 'bot.msg')
}
