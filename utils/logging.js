// local modules
const config = require('./config')

// function to compose log row string
const isTestMode = config.NODE_ENV === 'test'
const makeLogLine = (logLevel, params) => {
  return [
    (new Date()).toISOString(),
    logLevel,
    params.join(' ')
  ].join('|')
}

// write log entry of loglevel INFO
const info = (...params) => {
  if (!isTestMode) {
    console.log(makeLogLine('INFO', params))
  }
}

// write log entry of loglevel ERROR
const error = (...params) => {
  console.error(makeLogLine('ERROR', params))
}

module.exports = { info, error }
