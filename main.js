const apiKey = 'ftukbsji3qqrpl4nwiftgmsh7c2inufrg1fabpi1';
const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=&api_key=${apiKey}`;
const jsonConfigUrl = 'config.json';
const maxDescriptionLength = 800;

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function sanitizeHTML(htmlString) {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = htmlString;

  let textContent = tempElement.textContent || tempElement.innerText || '';
  textContent = textContent.replace(/(Tags:|Categories:)\s*\w+(\s*(Tags:|Categories:)\s*\w+)*/g, '');
  textContent = textContent.replace(/#(\w+)/g, '$1');
  textContent = textContent.replace(/#\w+/g, '');
  textContent = textContent.replace('Source: thehackernews.com – Author: .', '');

  return textContent;
}

function extractThumbnailFromDescription(description) {
  const imgTagRegex = /<img.*?src="(.*?)".*?>/i;
  const match = description.match(imgTagRegex);
  if (match) {
    return match[1];
  }
  return '';
}

function truncateDescription(description) {
  if (description.length > maxDescriptionLength) {
    return description.slice(0, maxDescriptionLength) + '...';
  }
  return description;
}

function fetchArticles(feedUrls, allKeywords, someKeywords, noKeywords) {
  allKeywords = allKeywords.map(keyword => keyword.toLowerCase());
  someKeywords = someKeywords.map(keyword => keyword.toLowerCase());
  noKeywords = noKeywords.map(keyword => keyword.toLowerCase());

  const promises = feedUrls.map(url => {
    const encodedUrl = encodeURIComponent(url);
    const feedApiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodedUrl}&api_key=${apiKey}`;
    return fetch(feedApiUrl).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  });

  Promise.allSettled(promises)
    .then(results => {
      const articles = results.flatMap(result =>
        result.status === 'fulfilled' ? result.value.items : []
      );
      articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      const filteredArticles = articles.filter(article => {
        const title = sanitizeHTML(article.title).replace(/<.*?>/g, '').toLowerCase();
        const description = sanitizeHTML(article.description).replace(/<.*?>/g, '').toLowerCase();

        const allKeywordsIncluded = allKeywords.every(keyword => title.includes(keyword) || description.includes(keyword));
        const someKeywordsIncluded = someKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
        const noKeywordsIncluded = noKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));

        return allKeywordsIncluded && someKeywordsIncluded && !noKeywordsIncluded;
      });

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
    titleElement.textContent = article.title;

    const thumbnailElement = document.createElement('img');
    thumbnailElement.classList.add('thumbnail');
    thumbnailElement.src = article.thumbnail || extractThumbnailFromDescription(article.description);

    const faviconElement = document.createElement('img');
    faviconElement.classList.add('favicon');
    faviconElement.src = `https://www.google.com/s2/favicons?domain=${article.link}`;

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
    linkElement.target = '_blank';
    const url = new URL(article.link);
    linkElement.textContent = url.hostname;

    articleElement.appendChild(titleElement);
    articleElement.appendChild(thumbnailElement);
    articleElement.appendChild(faviconElement);
    articleElement.appendChild(sourceElement);
    articleElement.appendChild(dateElement);
    articleElement.appendChild(descriptionElement);
    articleElement.appendChild(linkElement);

    articlesContainer.appendChild(articleElement);
  });
}

function loadConfig() {
  fetch(jsonConfigUrl)
    .then(response => response.json())
    .then(data => {
      const feedUrls = data.feedUrls;
      const keywordOptions = data.keywordOptions;

      // Create a dropdown for the keyword options
      const keywordDropdown = document.createElement('select');
      for (const option in keywordOptions) {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        keywordDropdown.appendChild(optionElement);
      }

      // Add an event listener to the dropdown
      keywordDropdown.addEventListener('change', () => {
        const selectedOption = keywordDropdown.value;
        const allKeywords = keywordOptions[selectedOption].allKeywords || [];
        const someKeywords = keywordOptions[selectedOption].someKeywords || [];
        const noKeywords = keywordOptions[selectedOption].noKeywords || [];
        fetchArticles(feedUrls, allKeywords, someKeywords, noKeywords);
      });

      // Add the dropdown to the page
      document.body.appendChild(keywordDropdown);

      // Fetch articles with the first keyword option
      const firstOption = Object.keys(keywordOptions)[0];
      const allKeywords = keywordOptions[firstOption].allKeywords || [];
      const someKeywords = keywordOptions[firstOption].someKeywords || [];
      const noKeywords = keywordOptions[firstOption].noKeywords || [];
      fetchArticles(feedUrls, allKeywords, someKeywords, noKeywords);
    })
    .catch(error => console.error(error));
}


loadConfig();
