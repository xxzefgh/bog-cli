const { Spinner } = require('cli-pen')
const log = require('./logger')
const config = require('./config')
const apiService = require('./api-service')

function login(username, password) {
  const loginSpinner = Spinner({
    spinner: 'earth',
    color: 'blue',
    text: 'Connecting...'
  })
  loginSpinner.start()

  apiService
    .login(username, password)
    .then(response => {
      loginSpinner.stop()

      if (response.data.code === 0) {
        log.success('Successfully authenticated')
      } else {
        log.error(
          'Authentication error' +
            '\nCode: ' +
            response.data.code +
            '\nMessage: ' +
            response.data.error
        )
      }
    })
    .catch(error => {
      loginSpinner.stop()
    })
}

function logout() {
  config.clear()
}

module.exports = { login, logout }
