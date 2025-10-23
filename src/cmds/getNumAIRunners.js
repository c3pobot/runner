'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const rabbitmq = require('src/rabbitmq')

const { dataList } = require('src/dataList')

module.exports = (data = {})=>{
  if(!dataList.numAIRunners) return

  if(!data?.rpcCall){
    rabbitmq.notify({ cmd: 'numAIRunnersNotify', numAIRunners: dataList.numAIRunners })
    log.debug('sent notification of numAIRunnersNotify...')
  }
  return { numAIRunners: dataList.numAIRunners }
}
