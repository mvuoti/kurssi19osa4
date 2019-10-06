const config = require('./config')

const makeLogLine = (logLevel, params) => {
  return [
    (new Date()).toISOString(),
    logLevel,
    params.join(' ')
  ].join('|')
}

const info = (...params) => {
  const isTestMode = config.NODE_ENV === 'test'
  if (!isTestMode) {
    console.log(makeLogLine('INFO', params))
  }
}

const error = (...params) => {
  console.error(makeLogLine('ERROR', params))
}

module.exports = { info, error }
