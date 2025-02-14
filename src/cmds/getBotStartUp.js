'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const rabbitmq = require('src/rabbitmq')

const getAutoComplete = require('./getAutoComplete')
const getBotSettings = require('./getBotSettings')
const getCmdMap = require('./getCmdMap')
const getMsgOpts = require('./getMsgOpts')

module.exports = (data = {})=>{
  getAutoComplete()
  getBotSettings()
  getCmdMap()
  getMsgOpts()
}
