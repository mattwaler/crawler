const { format } = require('date-fns')
const fs = require('fs').promises
const chalk = require('chalk')

const config = {
	concurrency: 5,
	urls: [],
	sitemap: 'https://mattwaler.com/sitemap.xml',
	report: {
    pages: 0,
		urls: [],
	},
	async onPageCrawl({ page, data }) {
    // Pull Out Variables
    const { url, index, total } = data

    // Visit Page & Log Progress
		await page.goto(url)
    console.log(chalk.blue(`${index + 1}/${total}: Scanning ${url}`))

    // Check Page for Element
    const elements = await page.$$('h1')

    // Do Stuff
    if (elements.length) {
      config.report.urls.push(url)
      config.report.pages++
    }
	},
	async onCrawlCompletion() {
		const timestamp = format(new Date(), 'yyyy-MM-dd HH-mm-ss')
		const content = JSON.stringify(config.report, null, 2)
		await fs.writeFile(`./reports/${timestamp}.json`, content, 'utf8')
	},
}

module.exports = config
