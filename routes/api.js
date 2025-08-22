
const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.post('/incoming-links', pageController.getIncomingLinks);
router.post('/outgoing-links', pageController.getOutgoingLinks);
router.post('/top-linked', pageController.getTopLinkedPages);

module.exports = router;
