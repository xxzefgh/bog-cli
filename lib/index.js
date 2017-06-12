const program = require('commander')
const actions = require('./actions')

const COMMAND_LOGIN = 'login [username]'
const COMMAND_LOGOUT = 'logout'
const COMMAND_INFO = 'info'

program.command(COMMAND_LOGIN).action(actions.ACTION_LOGIN)
program.command(COMMAND_LOGOUT).action(actions.ACTION_LOGOUT)
program.command(COMMAND_INFO).action(actions.ACTION_INFO)

program.parse(process.argv)
