'use strict'
const log = require('logger')
const Cmds = require('src/cmds')
module.exports = async(data, reply)=>{
  try{
    if(!data?.cmd) return
    log.debug(`${data?.cmd} processing started...`)
    if(Cmds[data.cmd]){
      let res = await Cmds[data.cmd](data)
      if(data?.rpcCall && res) reply(res)
    }
    log.debug(`${data?.cmd} processing done...`)
  }catch(e){
    log.error(e)
    if(data?.rpcCall) reply()
  }
}
