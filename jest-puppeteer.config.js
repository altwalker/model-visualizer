module.exports = {
  server: {
    command: 'npx webpack-dev-server --content-base examples/ --host 0.0.0.0 --port 8081',
    port: 8081,
    launchTimeout: 10000
  },
  launch: {
    args: ['--no-sandbox', '--disable-features=VizDisplayCompositor']
    // headless: false
  },
  browser: process.env.PUPPETEER_BROWSER || 'chromium'
}
