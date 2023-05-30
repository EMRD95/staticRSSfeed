const apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=';
const jsonConfigUrl = 'config.json';
const maxDescriptionLength = 800;
const storageKey = 'cachedArticles';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function sanitizeHTML(htmlString) {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = htmlString;

  // Get the text content of the HTML string
  let textContent = tempElement.textContent || tempElement.innerText || '';

  // Remove all tags and categories, both with and without spaces after the colon
  textContent = textContent.replace(/(Tags:|Categories:)\s*\w+(\s*(Tags:|Categories:)\s*\w+)*/g, '');

  // Remove "Source: thehackernews.com – Author: ."
  textContent = textContent.replace('Source: thehackernews.com – Author: .', '');

  return textContent;
}

function truncateDescription(description) {
  if (description.length > maxDescriptionLength) {
    return description.slice(0, maxDescriptionLength) + '...';
  }
  return description;
}

function saveArticlesToLocalStorage(articles) {
  const cachedArticles = localStorage.getItem(storageKey);
  const existingArticles = cachedArticles ? JSON.parse(cachedArticles) : [];
  
  // Add favicon URL to each article
  const updatedArticles = articles.map(article => ({
    ...article,
    faviconUrl: `https://www.google.com/s2/favicons?domain=${article.link}`
  }));

  const updatedCachedArticles = [...existingArticles, ...updatedArticles];
  localStorage.setItem(storageKey, JSON.stringify(updatedCachedArticles));
}
function fetchArticles(feedUrls, allKeywords, someKeywords, noKeywords) {
  // Transform keywords to lowercase
  allKeywords = allKeywords.map(keyword => keyword.toLowerCase());
  someKeywords = someKeywords.map(keyword => keyword.toLowerCase());
  noKeywords = noKeywords.map(keyword => keyword.toLowerCase());

  const promises = feedUrls.map(url =>
    fetch(apiUrl + encodeURIComponent(url)).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
  );

  Promise.allSettled(promises)
    .then(results => {
      const articles = results.flatMap(result =>
        result.status === 'fulfilled' ? result.value.items : []
      );
      articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      const filteredArticles = articles.filter(article => {
        const description = sanitizeHTML(article.description).replace(/<.*?>/g, '').toLowerCase();

        // All keywords must be included in the article
        const allKeywordsIncluded = allKeywords.every(keyword => description.includes(keyword));

        // At least one keyword must be included in the article
        const someKeywordsIncluded = someKeywords.some(keyword => description.includes(keyword));

        // None of the keywords in this list should be included in the article
        const noKeywordsIncluded = noKeywords.some(keyword => description.includes(keyword));

        return allKeywordsIncluded && someKeywordsIncluded && !noKeywordsIncluded;
      });

      saveArticlesToLocalStorage(filteredArticles);

      const articlesContainer = document.getElementById('articles');
      articlesContainer.innerHTML = '';

      filteredArticles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.classList.add('article');

        // Create favicon element
        const faviconElement = document.createElement('img');
        faviconElement.classList.add('favicon');
        faviconElement.src = `https://www.google.com/s2/favicons?domain=${article.link}`;

        // Append favicon to the article element
        articleElement.appendChild(faviconElement);

        const titleElement = document.createElement('h2');
        titleElement.textContent = article.title;

        const sourceElement = document.createElement('p');
        if (article.author || article.creator) {
          sourceElement.textContent = `Source: ${article.author || article.creator}`;
        }

        const dateElement = document.createElement('p');
        dateElement.textContent = formatDate(article.pubDate);

        const descriptionElement = document.createElement('p');
        const sanitizedDescription = sanitizeHTML(article.description).replace(/<.*?>/g, '');
        descriptionElement.textContent = truncateDescription(sanitizedDescription);

        const linkElement = document.createElement('a');
        linkElement.href = article.link;
        linkElement.classList.add('article-link');

        // Extract the domain from the URL
        const url = new URL(article.link);
        linkElement.textContent = url.hostname; // Use hostname as link text

        articleElement.appendChild(titleElement);
        articleElement.appendChild(sourceElement);
        articleElement.appendChild(dateElement);
        articleElement.appendChild(descriptionElement);
        articleElement.appendChild(linkElement);

        articlesContainer.appendChild(articleElement);
      });
    })
    .catch(error => console.error(error));
}

function loadArticlesFromLocalStorage() {
  const cachedArticles = localStorage.getItem(storageKey);
  return cachedArticles ? JSON.parse(cachedArticles) : [];
}

function shouldRefreshArticles(lastRefreshTimestamp) {
  const currentTime = new Date().getTime();
  const oneHourInMilliseconds = 60 * 60 * 1000;
  return currentTime - lastRefreshTimestamp >= oneHourInMilliseconds;
}

function refreshArticlesIfNeeded(feedUrls, allKeywords, someKeywords, noKeywords) {
  const lastRefreshTimestamp = localStorage.getItem('lastRefreshTimestamp');

  if (!lastRefreshTimestamp || shouldRefreshArticles(Number(lastRefreshTimestamp))) {
    localStorage.setItem('lastRefreshTimestamp', new Date().getTime().toString());
    fetchArticles(feedUrls, allKeywords, someKeywords, noKeywords);
  } else {
    const cachedArticles = loadArticlesFromLocalStorage();
    const articlesContainer = document.getElementById('articles');
    articlesContainer.innerHTML = '';

    cachedArticles.forEach(article => {
      const articleElement = document.createElement('div');
      articleElement.classList.add('article');

      // Create favicon element
      const faviconElement = document.createElement('img');
      faviconElement.classList.add('favicon');
      faviconElement.src = article.faviconUrl;

      // Append favicon to the article element
      articleElement.appendChild(faviconElement);

      const titleElement = document.createElement('h2');
      titleElement.textContent = article.title;

      const sourceElement = document.createElement('p');
      if (article.author || article.creator) {
        sourceElement.textContent = `Source: ${article.author || article.creator}`;
      }

      const dateElement = document.createElement('p');
      dateElement.textContent = formatDate(article.pubDate);

      const descriptionElement = document.createElement('p');
      const sanitizedDescription = sanitizeHTML(article.description).replace(/<.*?>/g, '');
      descriptionElement.textContent = truncateDescription(sanitizedDescription);

      const linkElement = document.createElement('a');
      linkElement.href = article.link;
      linkElement.classList.add('article-link');

      // Extract the domain from the URL
      const url = new URL(article.link);
      linkElement.textContent = url.hostname; // Use hostname as link text

      articleElement.appendChild(titleElement);
      articleElement.appendChild(sourceElement);
      articleElement.appendChild(dateElement);
      articleElement.appendChild(descriptionElement);
      articleElement.appendChild(linkElement);

      articlesContainer.appendChild(articleElement);
    });
  }
}

function loadConfig() {
  fetch(jsonConfigUrl)
    .then(response => response.json())
    .then(data => {
      const feedUrls = data.feedUrls;
      const allKeywords = data.allKeywords || [];
      const someKeywords = data.someKeywords || [];
      const noKeywords = data.noKeywords || [];
      refreshArticlesIfNeeded(feedUrls, allKeywords, someKeywords, noKeywords);
    })
    .catch(error => console.error(error));
}

loadConfig();