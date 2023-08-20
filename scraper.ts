const playwright = require('playwright')
const random_useragent = require('random-useragent')
//package installed in node by default for reading and writing files into file system
const fs = require('fs')

const BASE_URL = 'https://github.com/topics/playwright'

//Self-invoking func to create private scopes
//If not use semicolon - Automatic Semicolon Insertion (ASI) can cause issues
;(async () => {
  //create random agent that will process browser
  const agent = random_useragent.getRandom()
  const browser = await playwright.chromium.launch({ headless: true })
  //agent for preventing detenction of anti-scrapping system
  const context = await browser.newContext({ userAgent: agent })
  const page = await context.newPage({ bypassCSP: true })
  await page.setDefaultTimeout(30000)
  await page.setViewportSize({ width: 800, height: 600 })
  await page.goto(BASE_URL)

  //get data from website
  //repositories - all cards that are in repo, $$eval - takes all elements
  const repositories = await page.$$eval('article.border', (repoCards) => {
    //repoCards callback func, that iterates with map
    return repoCards.map((card) => {
      const [user, repo] = card.querySelectorAll('h3 a')
      //custom func
      const formatText = (element) => element && element.innerText.trim()

      return {
        user: formatText(user),
        repo: formatText(repo),
        url: repo.href,
      }
    })
  })
  console.log(repositories)
  //store data in file
  const logger = fs.createWriteStream('data.txt', { flag: 'w' })
  logger.write(JSON.stringify(repositories, null, ' '))
  //close browser
  await browser.close()
})().catch((error) => {
  console.log(error)
  process.exit(1)
})
