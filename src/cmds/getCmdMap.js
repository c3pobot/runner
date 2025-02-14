'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const rabbitmq = require('src/rabbitmq')

module.exports = async(data = {})=>{
  let array = await mongo.find('slashCmds', {})
  if(!array || array?.length === 0) return
  let cmdMap = {}
  for(let i in array){
    cmdMap = { ...cmdMap,...array[i].cmdMap }
  }
  if(!data.rpcCall){
    rabbitmq.notify({ cmd: 'cmdMapNotify', data: cmdMap })
    log.debug('sent notification of cmdMapNotify...')
  }  
  return cmdMap
}
