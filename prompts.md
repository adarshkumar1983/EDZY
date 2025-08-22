
# Prompts used in this project

## Initial Project Setup

*   `npm init -y && npm install express mongoose axios cheerio xml2js`
*   `mkdir models routes controllers && touch index.js prompts.md`

## Mongoose Schema

*   `Create a Mongoose schema for a page with fields for url, html, outgoingLinks (array of objects with url and type), and incomingLinks (array of strings).`

## Crawler

*   `Create a crawler in Node.js that fetches a sitemap, parses the XML, and then for each URL in the sitemap, fetches the HTML, extracts all the links, classifies them as internal or external, and saves the data to a MongoDB database. It should also update the incomingLinks for the linked pages.`

## Express Server and Routes

*   `Create a basic Express server that connects to MongoDB and has a simple root route.`
*   `Create three POST routes in Express: /api/incoming-links, /api/outgoing-links, and /api/top-linked.`

## API Controllers

*   `Create three controller functions for the API routes: getIncomingLinks, getOutgoingLinks, and getTopLinkedPages. getIncomingLinks should take a URL and return the incoming links. getOutgoingLinks should take a URL and return the outgoing links. getTopLinkedPages should take a number n and return the top n most linked pages.`

## Package.json script

*   `Add a script to package.json to run the crawler.`
