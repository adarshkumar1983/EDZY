
const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

const crawlController = require('../controllers/crawlController');

router.get('/page', pageController.getPageByUrl);
router.post('/incoming-links', pageController.getIncomingLinks);
router.post('/outgoing-links', pageController.getOutgoingLinks);
router.post('/top-linked', pageController.getTopLinkedPages);

// --- Body-Only Routes ---
router.post('/body-incoming-links', pageController.getBodyIncomingLinks);
router.post('/body-outgoing-links', pageController.getBodyOutgoingLinks);
// --- Crawler Control Routes ---
router.post('/crawl', crawlController.startCrawling);
router.get('/crawl-status', crawlController.getCrawlStatus);

module.exports = router;
