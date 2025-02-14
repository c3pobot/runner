'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const rabbitmq = require('src/rabbitmq')
const getCmdMap = require('./getCmdMap')

module.exports = async(data = {})=>{
  try{
    if(!data?.dbkey || !data?.cmdArray) return
    await mongo.rep('slashCmds', {_id: data.dbkey}, data.cmdArray)
    log.info('saved '+data.dbkey+' cmds to mongo...')
    getCmdMap(data)
  }catch(e){
    log.error(e)
  }
}
