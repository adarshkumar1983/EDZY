
const axios = require('axios');
const cheerio = require('cheerio');
const { xml2js } = require('xml-js');
const mongoose = require('mongoose');
const Page = require('./models/Page');

const SITEMAP_URL = 'https://www.edzy.ai/sitemap.xml';
const BASE_URL = 'https://www.edzy.ai';

const crawl = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost/edzy-crawler', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Fetch the sitemap
    const sitemapResponse = await axios.get(SITEMAP_URL);
    const sitemapXml = sitemapResponse.data;

    // Parse the sitemap
    const sitemapJs = xml2js(sitemapXml, { compact: true });
    const urls = sitemapJs.urlset.url.map((urlObj) => urlObj.loc._text);

    // Crawl each page
    for (const url of urls) {
      console.log(`Crawling ${url}`);
      const pageResponse = await axios.get(url);
      const html = pageResponse.data;

      const $ = cheerio.load(html);
      const outgoingLinks = [];
      const internalLinks = new Set();

      $('a').each((i, link) => {
        const href = $(link).attr('href');
        if (href) {
          let absoluteUrl;
          if (href.startsWith('http')) {
            absoluteUrl = href;
          } else {
            absoluteUrl = new URL(href, BASE_URL).href;
          }

          const type = absoluteUrl.startsWith(BASE_URL) ? 'internal' : 'external';
          outgoingLinks.push({ url: absoluteUrl, type });
          if (type === 'internal') {
            internalLinks.add(absoluteUrl);
          }
        }
      });

      // Save the page data
      const page = new Page({
        url,
        html,
        outgoingLinks,
      });
      await page.save();

      // Update incoming links for internal pages
      for (const internalLink of internalLinks) {
        await Page.updateOne(
          { url: internalLink },
          { $addToSet: { incomingLinks: url } }
        );
      }
    }

    console.log('Crawling finished');
  } catch (error) {
    console.error('Error during crawling:', error);
  } finally {
    await mongoose.connection.close();
  }
};

crawl();
