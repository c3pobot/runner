'use strict'
const log = require('logger')
const Cmds = require('src/cmds')
module.exports = async(data)=>{
  try{
    if(!data?.cmd) return
    log.debug(`${data?.cmd} processing started...`)
    if(Cmds[data.cmd]) await Cmds[data.cmd](data)
    log.debug(`${data?.cmd} processing done...`)
  }catch(e){
    log.error(e)
  }
}
