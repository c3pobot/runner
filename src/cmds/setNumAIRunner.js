'use strict'
const log = require('logger')
const mongo = require('mongoclient')

const getNumAIRunners = require('./getNumAIRunners')
const { dataList } = require('src/dataList')

module.exports = (data = {})=>{
  if(!data.numAIRunners) return
  if(!data.numAIRunners === dataList.numAIRunners) return
  dataList.numAIRunners = data.numAIRunners
  log.debug(`set numAIRunners to ${dataList.numAIRunners}...`)
  getNumAIRunners(data)
}
