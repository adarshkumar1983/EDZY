# Edzy Sitemap Crawler

This project is a Node.js application that crawls the sitemap of a website, extracts information about internal and external links, and provides an API to access this data.

## Features

-   **Sitemap Crawling**: Crawls a given sitemap to discover all the pages of a website.
-   **Link Extraction**: For each page, it extracts all the outgoing links.
-   **Link Classification**: Classifies links as either "internal" or "external".
-   **Incoming Link Tracking**: Tracks which pages link to any given page.
-   **API**: Provides a RESTful API to access the crawled data.
-   **Scalable**: The crawler processes pages in parallel batches to improve performance.
-   **Crawl Status Tracking**: Provides an endpoint to check the status of a crawl.

## Tech Stack

-   **Node.js**: JavaScript runtime environment.
-   **Express**: Web framework for Node.js.
-   **MongoDB**: NoSQL database for storing the crawled data.
-   **Mongoose**: Object Data Modeling (ODM) library for MongoDB.
-   **Axios**: Promise-based HTTP client for making requests to fetch the sitemap and pages.
-   **Cheerio**: A fast, flexible, and lean implementation of core jQuery designed specifically for the server to parse HTML.
-   **xml2js**: A library to convert XML to JavaScript objects, used for parsing the sitemap.
-   **dotenv**: A library to manage environment variables.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v14 or later)
-   [MongoDB](https://www.mongodb.com/try/download/community) (Make sure your MongoDB server is running)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd edzy-sitemap-crawler
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a file named `.env` in the root of the project and add the following content. You can change the `MONGO_URI` if your database is running on a different host or port.

    ```
    MONGO_URI=mongodb://localhost/edzy-crawler
    SITEMAP_URL=https://www.edzy.ai/sitemap.xml
    ```

### Running the Application

1.  **Start the server:**
    ```bash
    node index.js
    ```
    The server will start on port 3000, and you should see a message confirming the connection to the database.

2.  **Start and Monitor the Crawl:**
    Use the API endpoints below to start the crawl and monitor its status.

## API Endpoints

Here are the available API endpoints:

### Crawler Control

-   **Start the Crawl**
    -   **URL**: `/api/crawl`
    -   **Method**: `POST`
    -   **Description**: Starts the crawling process. Will return an error if a crawl is already in progress.
    -   **Response**: `202 Accepted` with a message `{"message":"Crawling started"}`

-   **Get Crawl Status**
    -   **URL**: `/api/crawl-status`
    -   **Method**: `GET`
    -   **Description**: Returns the current status of the crawl.
    -   **Response**:
        ```json
        {
          "status": "completed",
          "lastRun": "2025-08-22T12:00:00.000Z",
          "error": null
        }
        ```

### Page Data

-   **Get Page by URL**
    -   **URL**: `/api/page`
    -   **Method**: `GET`
    -   **Description**: Returns the entire database record for a single page.
    -   **Query Parameters**:
        -   `url`: The URL of the page to retrieve.

-   **Get Incoming Links**
    -   **URL**: `/api/incoming-links`
    -   **Method**: `POST`
    -   **Description**: Returns all the pages that link to a given URL.
    -   **Body**: `{ "url": "..." }`

-   **Get Outgoing Links**
    -   **URL**: `/api/outgoing-links`
    -   **Method**: `POST`
    -   **Description**: Returns all the pages that a given URL links out to.
    -   **Body**: `{ "url": "..." }`

-   **Get Top Linked Pages**
    -   **URL**: `/api/top-linked`
    -   **Method**: `POST`
    -   **Description**: Returns the top `n` most linked-to pages.
    -   **Body**: `{ "n": 5 }`

-   **Get Body-Only Incoming Links**
    -   **URL**: `/api/body-incoming-links`
    -   **Method**: `POST`
    -   **Description**: Returns incoming links found only in the `<body>`.
    -   **Body**: `{ "url": "..." }`

-   **Get Body-Only Outgoing Links**
    -   **URL**: `/api/body-outgoing-links`
    -   **Method**: `POST`
    -   **Description**: Returns outgoing links found only in the `<body>`.
    -   **Body**: `{ "url": "..." }`

## How It Works

The application is divided into two main parts:

1.  **The Crawler**: When you trigger the `/api/crawl` endpoint, the crawler fetches the sitemap, parses it to get a list of all the URLs, and then crawls each page in parallel batches. For each page, it extracts all the links, classifies them, and saves the data to the database. It also updates the `incomingLinks` for the pages that are linked to.

2.  **The API**: The Express server provides a set of API endpoints that allow you to query the data stored in the MongoDB database. The controllers contain the logic for fetching the data, and the routes map the endpoints to the controller functions.

## Future Improvements

-   **Robust Error Handling**: Implement a global error handling middleware to make the API more resilient.
-   **Automated Testing**: Add a testing framework like Jest to write unit and integration tests.
-   **Linting and Formatting**: Use ESLint and Prettier to enforce a consistent code style.