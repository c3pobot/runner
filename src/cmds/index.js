'use strict'
const Cmds = {}
Cmds.getAutoComplete = require('./getAutoComplete')
Cmds.getBotStartUp = require('./getBotStartUp')
Cmds.getCmdMap = require('./getCmdMap')
Cmds.getBotSettings = require('./getBotSettings')
Cmds.getMsgOpts = require('./getMsgOpts')
Cmds.getNumBotShards = require('./getNumBotShards')
Cmds.mongoCmd = require('./mongoCmd')
Cmds.reactions = require('./reactions')
Cmds.saveBotCmds = require('./saveBotCmds')
Cmds.setNumBotShards = require('./setNumBotShards')
module.exports = Cmds
