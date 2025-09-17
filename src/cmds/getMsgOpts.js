'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const rabbitmq = require('src/rabbitmq')
const getBotSettings = require('./getBotSettings')

module.exports = async(data = {})=>{
  let res = { vip: [], private: [] }
  let vip = await mongo.find('vip', { status: 1}, { _id: 1 })
  if(vip?.length > 0) res.vip = vip.map(x=>x._id)
  let botSettings = await getBotSettings()
  if(botSettings?.botSID){
    let subs = (await mongo.find('serverSubscriptions', { _id: botSettings.botSID.toString() }, { vip: 1 }))[0]
    if(subs?.vip?.length > 0) res.vip = res.vip.concat(subs?.vip)
  }
  let servers = await mongo.find('discordServer', {}, { _id: 1, instance: 1 })
  if(servers?.length > 0) res.private = servers?.filter(x=>x.instance === 'private')?.map(x=>x._id)
  if(!data?.rpcCall){
    rabbitmq.notify({ cmd: 'msgOptsNotify', data: res })
    log.debug('sent notification of msgOptsNotify...')
  }
  return res
}
