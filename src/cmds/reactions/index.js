'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const getResponse = require('./getResponse')
const rabbitmq = require('src/rabbitmq')

module.exports = async(msg = {})=>{
  let botPerms = new Set(msg.botPerms)
  if(!botPerms.has('EmbedLinks') || !botPerms.has('AttachFiles') || !botPerms.has('SendMessages')) return
  let content = msg.content.toString().trim().toLowerCase().split(' ')
  if(!(content?.length > 0)) return

  let gcr = (await mongo.find('reactions', { _id: 'global' }))[0]?.cr || []
  let lcr = (await mongo.find('reactions', { _id: msg.sId }))[0]?.cr || []
  let vcr = (await mongo.find('reactions', { _id: msg.dId, status: 1 }))[0]?.cr || []

  let phrase = content.shift().toLowerCase()
  for(let i in content) phrase += ' '+content[i].toLowerCase()
  let res = getResponse(vcr, phrase)
  if(!res) res = getResponse(lcr, phrase)
  if(!res) res = getResponse(gcr, phrase)

  if(!res) res = getResponse(vcr, phrase, true)
  if(!res) res = getResponse(lcr, phrase, true)
  if(!res) res = getResponse(gcr, phrase, true)
  if(!res) return

  let msg2send
  if(res.embed){
    msg2send = { embeds: [res.embed] }
  }else{
    msg2send = { content: res }
  }
  rabbitmq.notify({ cmd: 'sendMsg', sId: msg.sId, chId: msg.chId, msg: msg2send, podName: msg.podName }, msg.podName, 'bot.msg')
}
