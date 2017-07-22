const logger = require('../logger')
const config = require('../config')
const apiService = require('../api-service')

module.exports = function() {
  apiService
    .get('CLIENTS_GET_CLIENT_INFO')
    .then(response => {
      if (response.data.code === 0) {
        const result = response.data.result

        logger.info(
          result.client.firstNameInt + ' ' + result.client.lastNameInt,
          {
            title: 'info'
          }
        )

        logger.info(result.clientMails.map(entry => entry.mail).join(', '), {
          title: 'email'
        })

        logger.info(result.clientPhones.map(entry => entry.mobile).join(', '), {
          title: 'mobile phone'
        })
      }
    })
    .catch(error => {
      //
    })
}
