# staticRSSfeed
A straightforward and effective website for curating RSS feeds, tailored to provide news about artificial intelligence and its implications for cybersecurity.

https://emrd95.github.io/staticRSSfeed/

## Description

The Static RSS Feed is a light static website that utilizes JavaScript to fetch and sort RSS feeds from multiple sources based on user-defined keywords. It leverages the RSS2JSON API for the feed retrieval and parsing process, delivering a pleasant and accessible viewing experience.

The default configuration is set to fetch AI and cybersecurity-related content. However, you can easily change this to suit your interests by modifying the `config.json` file.

![image](https://github.com/EMRD95/staticRSSfeed/assets/114953576/08fde741-f08a-494f-8ffb-453151d2b194)

> Please note that this application uses the free tier of the RSS2JSON API, which comes with certain usage limitations. If you want to lift these limitations, you can opt for a paid plan and manage the API keys securely on your server-side setup.

## Setup Instructions

To deploy this project as a GitHub Pages site, follow these steps:

1. **Fork the Project**: Fork the [Static RSS Feed](https://github.com/EMRD95/staticRSSfeed) repository via the "Fork" button located on the top right corner of the GitHub page, creating a replica of the project within your account.

2. **Clone the Repository**: Upon forking, clone the repository onto your local machine using Git. Open the terminal and execute the command:
   ```
   git clone https://github.com/your-username/staticRSSfeed.git
   ```

3. **Modify the JSON Configuration File**: Within the project directory, locate and open the `config.json` file. Adjust the configuration settings to align with your requirements, such as updating the RSS feed URLs, keywords, among others.

4. **Activate GitHub Pages**: Navigate to the forked repository on GitHub and click on the "Settings" tab. Scroll down to the "GitHub Pages" section, select your preferred branch under the "Source" dropdown menu (usually "main" or "master"), and save your changes. This action will enable GitHub Pages for your repository.

5. **Access the Deployed Site**: After enabling GitHub Pages, your site will be accessible via `https://your-username.github.io/staticRSSfeed`. It might take a short while for the changes to propagate and your site to be accessible.

## Usage

- The application fetches RSS feeds based on your predefined URLs and keywords.
- It filters the fetched articles as per the keywords, presenting them in a friendly format.
- Clicking on the article links redirects to the original source for full reading.

## Contributing

Your contributions are always welcome! If you wish to suggest enhancements, report bugs, or make general improvements, feel free to open an issue or submit a pull request on the [Static RSS Feed](https://github.com/EMRD95/staticRSSfeed) repository.

## License

Static RSS Feed is available under the [MIT License](LICENSE). You are free to use and modify the project under the terms stipulated in the license.

## Acknowledgements

Our project benefits from the following technologies and resources:

- [RSS2JSON API](https://rss2json.com/)
- [GitHub Pages](https://pages.github.com/)
