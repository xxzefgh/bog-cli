const fs = require('fs')
const path = require('path')
const homedir = require('os').homedir()
const CryptoJS = require('crypto-js')

const CONFIG_KEY = 'cxlbJznshZOmOcTjgCzOlDaY5IszimFJ0Bax5imJFRzaqkhU'
const CONFIG_PATH = path.resolve(homedir, '.bog-cli.json')
const CONFIG_SCHEME = {
  username: null,
  password: null,
  sessionId: null
}

class ConfigManager {
  constructor() {
    this.last = null
  }

  initialize() {
    this.read()
  }

  /**
   * Read configuration from file and save local copy
   */
  read() {
    if (!fs.existsSync(CONFIG_PATH)) {
      this.write(CONFIG_SCHEME)
    }

    this.last = require(CONFIG_PATH)
  }

  /**
   * Write configuration file
   * @param {Object} jsonData
   */
  write(jsonData) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(jsonData, null, 2))
  }

  /**
   * Get configuration property
   * @param {String} key
   */
  get(key) {
    if (!this.validKey(key)) {
      return null
    }

    if (this.last === null) {
      this.read()
    }

    if (key === 'password') {
      return CryptoJS.AES
        .decrypt(this.last[key], CONFIG_KEY)
        .toString(CryptoJS.enc.Utf8)
    }

    return this.last[key]
  }

  /**
   * Set configuration property
   * @param {String} key
   * @param {String|Number|Null} value
   */
  set(key, value) {
    if (!this.validKey(key)) {
      return
    }

    if (this.last === null) {
      this.read()
    }

    if (key === 'password') {
      // Yup, we have some 'security' here 🤓
      value = CryptoJS.AES.encrypt(value, CONFIG_KEY).toString()
    }

    this.last[key] = value
    this.write(this.last)
  }

  /**
   * Reset configuration file to default scheme
   */
  clear() {
    this.write(CONFIG_SCHEME)
  }

  /**
   * Check if key is valid configuration property
   * @param {String} key
   */
  validKey(key) {
    return CONFIG_SCHEME.hasOwnProperty(key)
  }
}

module.exports = new ConfigManager()
