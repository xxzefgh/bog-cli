const co = require('co')
const prompt = require('co-prompt')
const logger = require('../logger')
const auth = require('../auth')

module.exports = function(username) {
  username = username || ''

  // Validate username
  if (username.length === 0) {
    logger.error('Invalid username')
    return
  }

  // Request for password input
  co(function*() {
    const password = yield prompt.password('password: ')

    // Validate password
    if (password.length === 0) {
      logger.error('Invalid password')
      return
    }

    auth.login(username, password)
  })
}
