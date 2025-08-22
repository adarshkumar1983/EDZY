require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const { parseString } = require('xml2js');
const Page = require('./models/Page');
const crawlerStatus = require('./crawlerStatus');

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

const crawlPage = async (url, context) => {
  try {
    console.log(`Crawling ${url}`);
    const pageResponse = await axios.get(url);
    const html = pageResponse.data;
    const $ = cheerio.load(html);

    // --- Full Page Crawl ---
    const outgoingLinks = [];
    const internalLinks = new Set();
    $('a').each((i, link) => {
      const href = $(link).attr('href');
      if (href) {
        let absoluteUrl = new URL(href, BASE_URL).href;
        const type = absoluteUrl.startsWith(BASE_URL) ? 'internal' : 'external';
        outgoingLinks.push({ url: absoluteUrl, type });
        if (type === 'internal') {
          internalLinks.add(absoluteUrl);
        }
      }
    });

    // --- Body-Only Crawl ---
    const bodyHtml = $('body').html();
    const bodyOutgoingLinks = [];
    const bodyInternalLinks = new Set();
    $('body a').each((i, link) => {
      const href = $(link).attr('href');
      if (href) {
        let absoluteUrl = new URL(href, BASE_URL).href;
        const type = absoluteUrl.startsWith(BASE_URL) ? 'internal' : 'external';
        bodyOutgoingLinks.push({ url: absoluteUrl, type });
        if (type === 'internal') {
          bodyInternalLinks.add(absoluteUrl);
        }
      }
    });

    await Page.updateOne(
      { url: url },
      {
        $set: {
          html: html,
          outgoingLinks: outgoingLinks,
          body: bodyHtml,
          bodyOutgoingLinks: bodyOutgoingLinks,
          lastcrawled: new Date(),
        },
      },
      { upsert: true }
    );

    for (const internalLink of internalLinks) {
      await Page.updateOne(
        { url: internalLink },
        { $addToSet: { incomingLinks: url } }
      );
    }

    for (const internalLink of bodyInternalLinks) {
      await Page.updateOne(
        { url: internalLink },
        { $addToSet: { bodyIncomingLinks: url } }
      );
    }
    context.successful++;
  } catch (error) {
    // console.error(`Error crawling ${url}: ${error.message}`);
    context.failed++;
    context.errors.push({ url: url, error: error.message });
  }
};

const crawl = async () => {
  const context = {
    successful: 0,
    failed: 0,
    errors: [],
  };

  try {
    crawlerStatus.status = 'crawling';
    crawlerStatus.lastRun = new Date();
    crawlerStatus.error = null;
    console.log('Crawling started');

    const sitemapResponse = await axios.get(SITEMAP_URL);
    const sitemapXml = sitemapResponse.data;
    const sitemapJs = await parseSitemap(sitemapXml);

    let urls = [];

    if (sitemapJs.sitemapindex) {
      const sitemapUrls = sitemapJs.sitemapindex.sitemap.map(s => s.loc[0]);
      for (const sitemapUrl of sitemapUrls) {
        const individualSitemapResponse = await axios.get(sitemapUrl);
        const individualSitemapXml = individualSitemapResponse.data;
        const individualSitemapJs = await parseSitemap(individualSitemapXml);
        urls = urls.concat(individualSitemapJs.urlset.url.map(u => u.loc[0]));
      }
    } else if (sitemapJs.urlset) {
      urls = sitemapJs.urlset.url.map((urlObj) => urlObj.loc[0]);
    }

    console.log(`Found a total of ${urls.length} URLs to crawl.`);

    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      console.log(`Crawling batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(urls.length / BATCH_SIZE)}`);
      const promises = batch.map(url => crawlPage(url, context));
      await Promise.all(promises);
    }

    console.log('--- Crawl Summary ---');
    console.log(`Successful crawls: ${context.successful}`);
    console.log(`Failed crawls: ${context.failed}`);
    console.log('---------------------');

    crawlerStatus.status = 'completed';
    crawlerStatus.summary = {
      successful: context.successful,
      failed: context.failed,
    };
    crawlerStatus.errors = context.errors;
    console.log('Crawling finished');
  } catch (error) {
    crawlerStatus.status = 'error';
    crawlerStatus.error = error.message;
    console.error('Error during crawling:', error);
  }
};

module.exports = { crawl };