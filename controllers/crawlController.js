
const { crawl } = require('../crawler');

exports.startCrawling = (req, res) => {
  crawl();
  res.status(202).json({ message: 'Crawling started' });
};
