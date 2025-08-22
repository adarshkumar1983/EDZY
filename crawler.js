require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const { parseString } = require('xml2js');
const Page = require('./models/Page');

const SITEMAP_URL = process.env.SITEMAP_URL;
const BASE_URL = 'https://www.edzy.ai';

const BATCH_SIZE = 10;

const parseSitemap = (xml) => {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

const crawlPage = async (url) => {
  try {
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

    // Save the page data using upsert
    await Page.updateOne(
      { url: url },
      { $set: { html: html, outgoingLinks: outgoingLinks } },
      { upsert: true }
    );

    // Update incoming links for internal pages
    for (const internalLink of internalLinks) {
      await Page.updateOne(
        { url: internalLink },
        { $addToSet: { incomingLinks: url } }
      );
    }
  } catch (error) {
    console.error(`Error crawling ${url}:`, error);
  }
};

const crawl = async () => {
  try {
    console.log('Crawling started');
    // Fetch the sitemap
    const sitemapResponse = await axios.get(SITEMAP_URL);
    const sitemapXml = sitemapResponse.data;

    // Parse the sitemap
    const sitemapJs = await parseSitemap(sitemapXml);
    const urls = sitemapJs.urlset.url.map((urlObj) => urlObj.loc[0]);

    // Crawl pages in batches
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      console.log(`Crawling batch ${i / BATCH_SIZE + 1}`);
      const promises = batch.map(crawlPage);
      await Promise.all(promises);
    }

    console.log('Crawling finished');
  } catch (error) {
    console.error('Error during crawling:', error);
  }
};

module.exports = { crawl };