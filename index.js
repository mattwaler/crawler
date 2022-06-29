const { Cluster } = require('puppeteer-cluster')
const Sitemapper = require('sitemapper')
const config = require('./config')

async function audit() {
  // Construct List From Pages And/Or Sitemap
	let urls = [...config.urls]
	if (config.sitemap) {
		console.log('Scanning sitemap...')
		const sitemap = new Sitemapper()
		const { sites } = await sitemap.fetch(config.sitemap)
		urls = [...urls, ...sites]
		console.log('Sitemap scanned!')
	}

	// Remove Duplicates
	urls = Array.from(new Set(urls))

	// Setup the batch jobs for Puppeteer crawling
	console.log(`Crawling ${urls.length} urls...`)
	const cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_CONTEXT,
		maxConcurrency: config.concurrency,
	})

	// Define Task
	await cluster.task(config.onPageCrawl)

	// Add each page in our settings to a queue
	urls.forEach((url, index) => {
    cluster.queue({ url, index, total: urls.length })
  })

  // Run Post Queue Actions
	await cluster.idle()
	await cluster.close()
	await config.onCrawlCompletion()
}

audit()
