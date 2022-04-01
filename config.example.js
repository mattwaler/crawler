const { format } = require('date-fns')
const chalk = require('chalk')
const fs = require('fs').promises

const config = {
	concurrency: 5,
	urls: [],
	sitemap: 'https://mattwaler.com/sitemap.xml',
	report: {
		urls: [],
	},
	async onPageCrawl({ page, data: url }) {
		console.log(`Crawling ${chalk.blue(url)}`)
		await page.goto(url)
		config.report.urls.push({
			url,
			title: await page.title(),
		})
	},
	async onCrawlCompletion() {
		const timestamp = format(new Date(), 'yyyy-MM-dd HH-mm-ss')
		const content = JSON.stringify(config.report, null, 2)
		await fs.writeFile(`./reports/${timestamp}.json`, content, 'utf8')
	},
}

module.exports = config
