
const Page = require('../models/Page');

exports.getIncomingLinks = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const page = await Page.findOne({ url });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(page.incomingLinks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getOutgoingLinks = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const page = await Page.findOne({ url });
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(page.outgoingLinks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTopLinkedPages = async (req, res) => {
  try {
    const { n } = req.body;
    if (!n || isNaN(n)) {
      return res.status(400).json({ error: 'A valid number n is required' });
    }

    const topPages = await Page.aggregate([
      {
        $project: {
          url: 1,
          incomingLinkCount: { $size: '$incomingLinks' },
        },
      },
      { $sort: { incomingLinkCount: -1 } },
      { $limit: parseInt(n, 10) },
    ]);

    res.json(topPages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
