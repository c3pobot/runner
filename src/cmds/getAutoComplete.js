'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const rabbitmq = require('src/rabbitmq')

module.exports = async(data = {})=>{
  let res = { nameKeys: {}, autoObj: {} }
  let nKeys = (await mongo.find('autoComplete', {_id: 'nameKeys'}))[0]
  if(nKeys?.data){
    res.nameKeys = nKeys.data
    res.gameVersion = nKeys.gameVersion
  }
  let obj = await mongo.find('autoComplete', {include: true}, {_id: 1, data: {name: 1, value: 1}})
  if(obj.length > 0){
    let tempObj = {}
    for(let i in obj){
      if(obj[i]?.data) tempObj[obj[i]._id] = obj[i].data
    }
    res.autoObj = tempObj
  }
  rabbitmq.notify({ cmd: 'autoCompleteNotify', data: res })
  log.debug('sent notification of autoCompleteNotify...')
}
