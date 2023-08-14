const apiKey = 'ftukbsji3qqrpl4nwiftgmsh7c2inufrg1fabpi1';
const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=&api_key=${apiKey}`;
const jsonConfigUrl = 'config.json';
const maxDescriptionLength = 800;

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function decodeHtmlEntities(text) {
  const textArea = document.createElement('textarea');
  // Replace &amp; with & to handle &amp;#039;
  const textWithAmpersand = text.replace(/&amp;/g, '&');
  textArea.innerHTML = textWithAmpersand;
  return textArea.value;
}

function parseGoogleUrl(url) {
  if (url.includes('www.google.com/url')) {
    const params = new URLSearchParams(url.split('?')[1]);
    return params.get('url');
  }
  return url;
}

function sanitizeHTML(htmlString) {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = decodeHtmlEntities(htmlString);

  let textContent = tempElement.textContent || tempElement.innerText || '';
  textContent = textContent.replace(/(Tags:|Categories:)\s*\w+(\s*(Tags:|Categories:)\s*\w+)*/g, '');
  textContent = textContent.replace(/#(\w+)/g, '$1');
  textContent = textContent.replace(/#\w+/g, '');
  textContent = textContent.replace('Source: thehackernews.com – Author: .', '');
  
  // Remove URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  textContent = textContent.replace(urlRegex, '');

  return textContent;
}

function extractThumbnailFromDescription(description) {
  const imgTagRegex = /<img.*?src="(.*?)".*?>/i;
  const wpImageDivRegex = /<div class="wp-block-image">.*?<img.*?src="(.*?)".*?>.*?<\/div>/is;

  let match = description.match(imgTagRegex);
  if (match) {
    return match[1].replace('http://', 'https://'); // Update the protocol to HTTPS
  }

  match = description.match(wpImageDivRegex);
  if (match) {
    return match[1].replace('http://', 'https://'); // Update the protocol to HTTPS
  }

  return '';
}

function truncateDescription(description) {
  if (description.length > maxDescriptionLength) {
    return decodeHtmlEntities(description.slice(0, maxDescriptionLength)) + '...';
  }
  return decodeHtmlEntities(description);
}


function fetchArticles(feedUrls, allKeywords, someKeywords, noKeywords) {
  const progressBar = document.getElementById('progress-bar');
  progressBar.style.width = '0%';
  allKeywords = allKeywords.map(keyword => keyword.toLowerCase());
  someKeywords = someKeywords.map(keyword => keyword.toLowerCase());
  noKeywords = noKeywords.map(keyword => keyword.toLowerCase());

  const promises = feedUrls.map((url, index) => {
    const encodedUrl = encodeURIComponent(url);
    const feedApiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodedUrl}&api_key=${apiKey}`;
    return fetch(feedApiUrl).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Update progress bar width after each API call
      const progressBar = document.getElementById('progress-bar');
      progressBar.style.width = `${(index + 1) / feedUrls.length * 100}%`;
      return response.json();
    });
  });


Promise.allSettled(promises)
    .then(results => {
      let articles = results.flatMap(result =>
        result.status === 'fulfilled' ? result.value.items : []
      );
      articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      articles = articles.map(article => {
        article.link = parseGoogleUrl(article.link); // update the link
        article.faviconUrl = `https://www.google.com/s2/favicons?domain=${article.link}`; // update the faviconUrl
        return article;
      });

      const filteredArticles = articles.filter(article => {
        const title = sanitizeHTML(article.title).replace(/<.*?>/g, '').toLowerCase();
        const description = sanitizeHTML(article.description).replace(/<.*?>/g, '').toLowerCase();

        const allKeywordsIncluded = allKeywords.every(keyword => title.includes(keyword) || description.includes(keyword));
        const someKeywordsIncluded = someKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
        const noKeywordsIncluded = noKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));

        return allKeywordsIncluded && someKeywordsIncluded && !noKeywordsIncluded;
      });

      const progressBar = document.getElementById('progress-bar');
      progressBar.style.width = '100%'; // Filtering phase is from 50 to 100%
      displayArticles(filteredArticles);
    })
    .catch(error => console.error(error));
}

function displayArticles(articles) {
  const articlesContainer = document.getElementById('articles');
  articlesContainer.innerHTML = '';

  articles.forEach(article => {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');

    const titleElement = document.createElement('h2');
    const sanitizedTitle = sanitizeHTML(article.title).replace(/<.*?>/g, '');
    titleElement.textContent = decodeHtmlEntities(sanitizedTitle);
	  
    const thumbnailElement = document.createElement('img');
    thumbnailElement.classList.add('thumbnail');
    thumbnailElement.src = article.thumbnail || extractThumbnailFromDescription(article.description);

    const faviconElement = document.createElement('img');
    faviconElement.classList.add('favicon');
    faviconElement.src = article.faviconUrl;

    const sourceElement = document.createElement('p');
    if (article.author || article.creator) {
    sourceElement.textContent = `Source: ${decodeHtmlEntities(article.author) || decodeHtmlEntities(article.creator)}`;
    }

    const dateElement = document.createElement('p');
    dateElement.textContent = formatDate(article.pubDate);

    const descriptionElement = document.createElement('p');
	const sanitizedDescription = sanitizeHTML(article.description).replace(/<.*?>/g, '');
    descriptionElement.textContent = decodeHtmlEntities(truncateDescription(sanitizedDescription));


    const linkElement = document.createElement('a');
    linkElement.href = article.link;
    linkElement.classList.add('article-link');
    linkElement.target = '_blank';
    const url = new URL(article.link);
    linkElement.textContent = url.hostname;

    const factCheckButton = document.createElement('button');
    factCheckButton.textContent = '🤔';
	factCheckButton.classList.add('fact-check'); // Add the new class
    factCheckButton.onclick = () => {
	const query = encodeURIComponent(decodeHtmlEntities(sanitizedTitle));
	window.open(`https://www.google.com/search?q=${query}`, '_blank');
    };

    articleElement.appendChild(titleElement);
    articleElement.appendChild(thumbnailElement);
    articleElement.appendChild(faviconElement);
    articleElement.appendChild(sourceElement);
    articleElement.appendChild(dateElement);
    articleElement.appendChild(descriptionElement);
    articleElement.appendChild(linkElement);
    articleElement.appendChild(factCheckButton); // Add the fact check button to the article

    articlesContainer.appendChild(articleElement);
  });
}

function loadConfig() {
  fetch(jsonConfigUrl)
    .then(response => response.json())
    .then(data => {
      const feedUrls = data.feedUrls;
      const allKeywords = data.allKeywords || [];
      const someKeywords = data.someKeywords || [];
      const noKeywords = data.noKeywords || [];
      fetchArticles(feedUrls, allKeywords, someKeywords, noKeywords);
    })
    .catch(error => console.error(error));
}

loadConfig();
