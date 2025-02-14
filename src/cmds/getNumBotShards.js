'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const rabbitmq = require('src/rabbitmq')

const { dataList } = require('src/dataList')

module.exports = (data = {})=>{
  if(!dataList.numBotShards) return
  rabbitmq.notify({ cmd: 'numBotShardsNotify', numBotShards: dataList.numBotShards })
  log.debug('sent notification of numBotShardsNotify...')
}
