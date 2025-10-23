'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const { dataList } = require('src/dataList')
const { notify } = require('src/rabbitmq')
const Cmds = {}
Cmds['setLogLevel'] = (data = {})=>{
  try{
    if(data?.logLevel){
      data?.logLevel
    }else{
      log.setLevel('info');
    }
  }catch(e){
    log.error(e)
  }
}
Cmds.numBotShardsNotify = ({ numBotShards })=>{
  if(!numBotShards) return
  if(numBotShards === dataList.numBotShards) return
  dataList.numBotShards = numBotShards
  log.info(`set number of numBotShards to ${dataList.numBotShards}...`)
}
Cmds.requestNumBotShards = ()=>{
  if(!dataList.numBotShards) return
  notify({cmd: 'numBotShardsNotify', numBotShards: dataList.numBotShards})
  log.debug(`sent notify for requestNumBotShards...`)
}
Cmds.guildCountUpdate = ({ shardNum, guildCount }) =>{
  if(!(shardNum >= 0 && guildCount > 0 )) return
  let nameKey = `server.${shardNum}`
  mongo.set('meta', { _id: 'bot-stats' }, { [nameKey]: { shardNum: shardNum, guildCount: guildCount } })
}
module.exports = (data)=>{
  try{
    if(!data) return
    if(Cmds[data?.routingKey]) Cmds[data.routingKey](data)
    if(Cmds[data?.cmd]) Cmds[data.cmd](data)
  }catch(e){
    log.error(e)
  }
}
