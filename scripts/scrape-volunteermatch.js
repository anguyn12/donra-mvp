const puppeteer = require('puppeteer')
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const siteConfigs = {
  volunteermatch: {
    baseUrl: 'https://www.volunteermatch.org/search?l=',
    cardSelector: '.pub-srp-opps__opp',
    selectors: {
      title: '.pub-srp-opps__title',
      link: 'a',
      location: '.pub-srp-opps__loc',
      description: '.pub-srp-opps__desc',
      time: '.pub-srp-opps__date'
    },
    cities: ['Los Angeles, CA', 'New York, NY', 'Chicago, IL']
  },
  laworks: {
    baseUrl: 'https://volunteer.laworks.com/search?vol_dist=25&vol_lat=34.0522&vol_long=-118.2437&vol_loc=',
    cardSelector: '.search-opportunity-list .opportunity',
    selectors: {
      title: '.opportunity-title',
      link: 'a',
      location: '.opportunity-location',
      description: '.opportunity-description',
      time: '.opportunity-date-time'
    },
    cities: ['Los Angeles, CA']
  }
}

async function scrapeAllSites() {
  const browser = await puppeteer.launch({
    headless: 'new', // use 'new' for Chromium 117+ compatibility
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  for (const siteKey of Object.keys(siteConfigs)) {
    const config = siteConfigs[siteKey]

    for (const city of config.cities) {
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 800 })

      const fullUrl = `${config.baseUrl}${encodeURIComponent(city)}`

      await page.goto(fullUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 90000
      })

      await new Promise(resolve => setTimeout(resolve, 5000))

      const pageContent = await page.content()
      fs.writeFileSync(`debug-${siteKey}-${city.replace(/[^a-z0-9]/gi, '_')}.html`, pageContent)
      console.log(`🔍 Saved current page HTML for ${siteKey} - ${city}`)

      const hasSelector = await page.$(config.cardSelector)
      if (!hasSelector) {
        console.error(`❌ No opportunity cards found for ${siteKey} - ${city}.`)
        await page.close()
        continue
      }

      const opportunities = await page.evaluate((config, siteKey) => {
        const cards = Array.from(document.querySelectorAll(config.cardSelector))
        const results = []

        for (let i = 0; i < cards.length && results.length < 20; i++) {
          const card = cards[i]
          const title = card.querySelector(config.selectors.title)?.innerText.trim() || 'Untitled'
          const link = card.querySelector(config.selectors.link)?.href || ''
          const location = card.querySelector(config.selectors.location)?.innerText.trim() || 'N/A'
          const description = card.querySelector(config.selectors.description)?.innerText.trim() || ''
          const time = card.querySelector(config.selectors.time)?.innerText.trim() || ''

          results.push({ title, link, location, description, time, source: siteKey })
        }

        return results
      }, config, siteKey)

      console.log(`🧠 Found ${opportunities.length} opportunities for ${siteKey} in ${city}.`)

      for (const opp of opportunities) {
        const { data: existing, error: fetchError } = await supabase
          .from('opportunities')
          .select('id')
          .eq('source', siteKey)
          .eq('title', opp.title)
          .eq('link', opp.link)
          .limit(1)

        if (fetchError) {
          console.error('❌ Fetch error:', fetchError.message)
          continue
        }

        if (existing.length > 0) {
          console.log('⚠️ Skipped duplicate:', opp.title)
          continue
        }

        const { error } = await supabase.from('opportunities').insert([{ ...opp, source: siteKey }])
        if (error) console.error('❌ Error inserting:', opp.title, error.message)
        else console.log('✅ Inserted:', opp.title)
      }

      await page.close()
    }
  }

  await browser.close()
}

scrapeAllSites()
