
const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

const crawlController = require('../controllers/crawlController');

router.post('/incoming-links', pageController.getIncomingLinks);
router.post('/outgoing-links', pageController.getOutgoingLinks);
router.post('/top-linked', pageController.getTopLinkedPages);
router.post('/crawl', crawlController.startCrawling);

module.exports = router;
