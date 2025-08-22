
// This object will be shared across the application
const crawlerStatus = {
  status: 'idle', // idle, crawling, completed, error
  lastRun: null,
  error: null,
};

module.exports = crawlerStatus;
