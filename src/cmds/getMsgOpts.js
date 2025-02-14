'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const rabbitmq = require('src/rabbitmq')

module.exports = async(data = {})=>{
  let res = { vip: [], private: [] }
  let vip = await mongo.find('vip', { status: 1}, { _id: 1 })
  if(vip?.length > 0) res.vip = vip.map(x=>x._id)

  let servers = await mongo.find('discordServer', {}, { _id: 1, instance: 1 })
  if(servers?.length > 0) res.private = servers?.filter(x=>x.instance === 'private')?.map(x=>x._id)
  rabbitmq.notify({ cmd: 'msgOptsNotify', data: res })
  log.debug('sent notification of msgOptsNotify...')
}
