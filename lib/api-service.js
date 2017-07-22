const { Spinner } = require('cli-pen')
const axios = require('axios')
const querystring = require('querystring')
const logger = require('./logger')
const config = require('./config')

const API_SERVER_ENDPOINT = 'https://login.bog.ge/rb-middleware-api-connector'
const SERVICE_ID_LOGIN = 'IDENTITY_LOGIN_USER_UNIVERSAL'
const DEFAULT_PARAMS = {
  channel: 'MOBILE',
  userId: 'MOBILE'
}

class ApiService {
  /**
   * Make login request
   * @param {String} username
   * @param {String} password
   */
  login(username, password) {
    const options = {
      method: 'POST',
      url: buildApiUri({ serviceId: SERVICE_ID_LOGIN }),
      data: querystring.stringify({
        userName: username,
        password: password
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    const loginPromise = axios(options)
    loginPromise.then(response => {
      if (response.data.code === 0) {
        config.set('username', username)
        config.set('password', password)
        config.set('sessionId', response.data.result.sessionId)
      }
    })

    return loginPromise
  }

  /**
   * Make GET request to API
   * @param {String} serviceId
   * @return {Promise}
   */
  get(serviceId) {
    const options = {
      method: 'GET',
      url: buildApiUri({ serviceId })
    }

    return this.expiredSessionMiddleware(options)
  }

  /**
   * Make POST request to API
   * @param {String} serviceId
   * @param {Object} data
   * @return {Promise}
   */
  post(serviceId, data) {
    const options = {
      method: 'POST',
      url: buildApiUri({ serviceId }),
      data: data
    }

    return this.expiredSessionMiddleware(options)
  }

  /**
   * Make HTTP request and automatically retry authentication
   * if expired session error code is returned
   * @param {Object} options
   */
  expiredSessionMiddleware(options) {
    return new Promise((resolve, reject) => {
      // Make request with saved session ID
      axios(patchOptionsUri(options, { sessionId: config.get('session') }))
        .then(response => {
          // Re-authenticate if session is expired
          if (response.data.code === 13) {
            const loginSpinner = Spinner({
              spinner: 'monkey',
              text: 'Session expired, retrying authentication...'
            })

            loginSpinner.start()
            this.login(config.get('username'), config.get('password')).then(
              loginResponse => {
                loginSpinner.stop()

                // Make original request with new session ID
                // if authentication is successfull
                if (loginResponse.data.code === 0) {
                  const retryOptions = patchOptionsUri(options, {
                    sessionId: config.get('sessionId')
                  })
                  axios(retryOptions).then(resolve, reject)
                } else {
                  // Resolve with original request response
                  resolve(response)
                }
              },
              error => {
                loginSpinner.stop()

                // Resolve with original request response
                resolve(response)
              }
            )
          } else {
            // Resolve with original request response
            resolve(response)
          }
        })
        .catch(reject)
    })
  }
}

/**
 * Build API uri with params object
 * @param {Object} urlParams
 */
function buildApiUri(urlParams) {
  if (typeof urlParams !== 'object' || urlParams === null) {
    urlParams = {}
  }

  return API_SERVER_ENDPOINT + '?' + mergeAndStringifyURLParams(urlParams)
}

/**
 * Add URL params to request options object
 * @param {Object} options
 * @param {Object} patch
 */
function patchOptionsUri(options, patch) {
  const patchParams = stringifyURLParams(patch)

  return Object.assign({}, options, {
    url: options.url + '&' + patchParams
  })
}

/**
 * Merge new url params with defaults and stringify
 * @param {Object} urlParams
 */
function mergeAndStringifyURLParams(urlParams) {
  return stringifyURLParams(Object.assign({}, DEFAULT_PARAMS, urlParams))
}

/**
 * Convert data object to http query string
 * @param {Object} dataObject
 */
function stringifyURLParams(dataObject) {
  return Object.keys(dataObject)
    .map(function(key) {
      return key + '=' + dataObject[key]
    })
    .join('&')
}

module.exports = new ApiService()
