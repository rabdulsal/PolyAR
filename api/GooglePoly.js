export default class GooglePoly {

  constructor(apiKey) {
    this.apiKey = apiKey;
    this.currentResults = [];
    this.nextPageToken = '';
    this.keywords = '';
  }

  static getQueryURL(apiKey, keywords, nextPageToken) {
    const baseURL = 'https://poly.googleapis.com/v1/assets?';
    let url = `${baseURL}key=${apiKey}`;
    url += '&pageSize=10';
    url += '&maxComplexity=MEDIUM';
    url += '&format=OBJ';
    if (keywords) {
      const encodedKeywords = encodeURIComponent(keywords);
      url += `&keywords=${encodedKeywords}`;
    }
    if (nextPageToken) { url += `&pageToken=${nextPageToken}`; }
    console.log(`URL: ${url}`);
    return url;
  }

  setSearchParams = (keywords) => {
    this.currentResults = [];
    this.nextPageToken = '';
    this.keywords = keywords;
  }

  getSearchResults() {
    const url = GooglePoly.getQueryURL(this.apiKey, this.keywords, this.nextPageToken);

    return fetch(url).then((response) => {
      console.log(`Response: ${response}`);
      return response.json();
    }).then(function (data) {
      this.currentResults = this.currentResults.concat(data.assets);
      this.nextPageToken = data.nextPageToken;
      return Promise.resolve(data.assets);
    }.bind(this));
  }
}
