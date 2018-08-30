import ExpoTHREE from 'expo-three';
import AssetUtils from 'expo-asset-utils';
import * as THREE from 'three';
import MTLLoader from 'three-mtl-loader';
import OBJLoader from 'three-obj-loader';

OBJLoader(THREE);

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
      return response.json();
    }).then(function (data) {
      this.currentResults = this.currentResults.concat(data.assets);
      this.nextPageToken = data.nextPageToken;
      return Promise.resolve(data.assets);
    }.bind(this));
  }

  // Returns a Three.js object
  static getThreeModel(objectData, success, failure) {
    if (!success) { success = function () { }; }
    if (!failure) { failure = function () { }; }
    if (!objectData) { failure('objectData is null'); return; }

    // Search for a format...
    const format = objectData.formats.find(_format => { return _format.formatType === 'OBJ'; });
    if (format === undefined) { failure('No format found'); return; }

    // Search for a resource...
    const obj = format.root;
    const mtl = format.resources.find(resource => { return resource.url.endsWith('mtl'); });
    const tex = format.resources.find(resource => { return resource.url.endsWith('png'); });
    const path = obj.url.slice(0, obj.url.indexOf(obj.relativePath));

    // Load the MTL...
    let mtlLoader = new MTLLoader();
    mtlLoader.setCrossOrigin(true);
    mtlLoader.setTexturePath(path);
    mtlLoader.load(mtl.url, function(materials) {

        // Load the OBJ...
        let objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(obj.url, async function(object) {

            // If there is a texture, apply it...
            if (tex !== undefined) {
                const texUri = await AssetUtils.uriAsync(tex.url);
                const texture = new THREE.MeshBasicMaterial({ map: await ExpoTHREE.loadAsync(texUri) });
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = texture;
                    }
                });
            }

            // Return the object...
            success(object);
        });
    });
  }
}
