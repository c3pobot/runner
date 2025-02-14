'use strict'
const log = require('logger')
const mongo = require('mongoclient')

const getNumBotShards = require('./getNumBotShards')
const { dataList } = require('src/dataList')

module.exports = (data = {})=>{
  if(!data.numBotShards) return
  if(!data.numBotShards === dataList.numBotShards) return
  dataList.numBotShards = data.numBotShards
  log.debug(`set numBotShards to ${dataList.numBotShards}...`)
  getNumBotShards(data)
}
