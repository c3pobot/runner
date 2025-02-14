'use strict'
const mongo = require('mongoclient')
module.exports = async({ mongoCmd , collection, query = {}, opt })=>{
  if(!mongoCmd || !collection) return
  return await mongo[mongoCmd](collection, query, opt)
}
