#!/usr/bin/env node

import app from '../index.js'

const development = process.env.NODE_END !== 'production'

async function main() {
  if (development) {
    const ngrok = require('ngrok')
    const ngrokURL = await ngrok.connect({
      addr: '0.0.0.0:3000',
    })
    app.set('webhookHost', ngrokURL)
  }

  // run server
  app.listen(app.get('port'), function() {
    console.log(`Listening on http://localhost:${app.get('port')}`)
  })
}

main()
