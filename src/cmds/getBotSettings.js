'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const rabbitmq = require('src/rabbitmq')

module.exports = async(data = {})=>{
  let obj = (await mongo.find('botSettings', { _id: '1' }, { _id: 0, TTL: 0 }))[0]
  return obj
}
