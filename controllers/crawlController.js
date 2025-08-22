
const { crawl } = require('../crawler');

const crawlerStatus = require('../crawlerStatus');

exports.startCrawling = (req, res) => {
  if (crawlerStatus.status === 'crawling') {
    return res.status(409).json({ message: 'A crawl is already in progress.' });
  }
  crawl();
  res.status(202).json({ message: 'Crawling started' });
};

exports.getCrawlStatus = (req, res) => {
  res.json(crawlerStatus);
};
