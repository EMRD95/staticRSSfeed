# staticRSSfeed
A straightforward and effective website for curating RSS feeds, tailored to provide news about artificial intelligence and its implications for cybersecurity.

https://emrd95.github.io/staticRSSfeed/

## Description

The Static RSS Feed is a light static website that utilizes JavaScript to fetch and sort RSS feeds from multiple sources based on user-defined keywords. It leverages the RSS2JSON API for the feed retrieval and parsing process, delivering a pleasant and accessible viewing experience.

The default configuration is set to fetch AI and cybersecurity-related content. However, you can easily change this to suit your interests by modifying the `config.json` file.

![image](https://github.com/EMRD95/staticRSSfeed/assets/114953576/e6a3d102-5b16-4a89-a8c7-335560e13559)


> Please note that this application uses the free tier of the RSS2JSON API, which comes with certain usage limitations (25 feeds max). If you want to lift these limitations, you can opt for a paid plan.

## Setup Instructions

To use this project, follow these simple steps:

1. **Create an API Key**: Go to [rss2json](https://rss2json.com/) and create an account. During this process, you'll get an API key.

2. **Set HTTP Referrer**: While still on the rss2json site, set the HTTP referrer to your domain name. This will ensure that your API key is only usable for requests from your domain.

3. **Fork the Repository**: Navigate to the [Static RSS Feed](https://github.com/EMRD95/staticRSSfeed) repository on GitHub and click the "Fork" button in the upper-right corner of the page. This will create a copy of the repository in your own GitHub account.

4. **Edit the JavaScript File**: 
    - In your forked repository, navigate to the `main.js` file. 
    - Click on the pencil icon (or "Edit this file") in the upper-right corner of the file view to start editing the file. 
    - Look for the `const apiKey = 'Your-API-Key-Here';` line and replace `'Your-API-Key-Here'` with the API key you got from rss2json, enclosed in single quotes. 
    - Scroll down and click on "Commit changes".

5. **Locate the JSON Configuration and Keywords File**: In your forked repository on GitHub, you'll need to navigate to two separate files:
   - The `config.json` file, which contains the RSS feed URLs.
   - The `keywords.json` file, which manages keyword filtering for the feed articles.

6. **Edit the JSON Configuration File**: 
   - Click on the pencil icon (or "Edit this file") in the upper-right corner of the file view for `config.json`.
   - Under the `"feedUrls"` key, you will find an array of the URLs for the RSS feeds. Replace the existing URLs with the ones for your desired feeds. Each URL should be enclosed in quotes and separated by commas. 
     For example: 
     ```json
     "feedUrls": ["http://myfavoritesite.com/rss", "http://anothergreatsite.com/feed"]
     ```

7. **Edit the Keywords JSON File**:
   - Navigate to the `keywords.json` file and click on the pencil icon to edit.
   - Here you'll see several arrays corresponding to different keyword filters:
     - `"allKeywords"`: Keywords that must all be present in an article for it to be included.
     - `"someKeywords"`: At least one of these keywords must be present in an article for inclusion.
     - `"noKeywords"`: Keywords that, if present, exclude an article from the feed.
   - Update these arrays with your desired keywords for filtering.

     An example of modified keyword settings could be:
     ```json
     "allKeywords": ["AI", "OpenAI"],
     "someKeywords": ["research", "GPT-4"],
     "noKeywords": ["negative"]
     ```

8. **Activate GitHub Pages**: Go back to the main page of your forked repository and click on the "Settings" tab. Scroll down to the "GitHub Pages" section. Select the "main" (or "master") branch under the "Source" dropdown and click "Save". GitHub will now automatically build and deploy your site.

9. **Access Your Site**: After a few moments, your site will be live! You can access it at `https://<your-username>.github.io/staticRSSfeed`. 

## Usage

- The application fetches RSS feeds based on your predefined URLs and keywords.
- It filters the fetched articles as per the keywords, presenting them in a friendly format.
- Clicking on the article links redirects to the original source for full reading.

## Supported Websites Integration
The website supports a wide variety of RSS feeds from different platforms, enhancing content diversity. Here are some notable integrations:
- **YouTube**: Fetches video content using RSS feed URLs.
- **Google Alert**: Integrates with Google Alerts to fetch specific news or topics.
- **Nitter**: Uses Nitter to retrieve specific tweets based on search queries.

## Contributing

Your contributions are always welcome! If you wish to suggest enhancements, report bugs, or make general improvements, feel free to open an issue or submit a pull request on the [Static RSS Feed](https://github.com/EMRD95/staticRSSfeed) repository.

## License

Static RSS Feed is available under the [MIT License](LICENSE). You are free to use and modify the project under the terms stipulated in the license.

## Acknowledgements

Our project benefits from the following technologies and resources:

- [RSS2JSON API](https://rss2json.com/)
- [GitHub Pages](https://pages.github.com/)
