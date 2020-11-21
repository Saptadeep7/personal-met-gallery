// Define Constants
const url = 'https://collectionapi.metmuseum.org/public/collection/v1/';
const mainGalleryButton = document.querySelector('#btn-main');
const personalGalleryButton = document.querySelector('#btn-personal');

// Gallery Class
class Gallery {

  // Display Main Gallery List
  static async displayMainGalleryList() {
    const queryUrl = `${url}search?q=sunflowers`;
    const galleryList = await fetch(queryUrl)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          console.log('Something went wrong !');
        }
      })
      .then((data) => {
        let resultData = [];
        let galleryDetails = [];
        let objectIds = data.objectIDs;
        if (objectIds.length > 0) {
          objectIds.forEach((objectId) => {
            galleryDetails = Gallery.fetchEachImageDetails(
              objectId,
              resultData
            );
          });
          return Gallery.createGalleryTemplate(galleryDetails);
        }
      })
      .catch((error) => console.log('Request failed', error));
  }

  // Fetch Each Image Details Data
  static async fetchEachImageDetails(objectId, resultData) {
    return await fetch(`${url}objects/${objectId}`)
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        resultData.push(data);
        return resultData;
      });
  }

  // Display Personal Gallery
  static async displayPersonalGallery() {
    let personalResultData = [];
    let personalGalleryDetails = [];
    let personalObjectId = Gallery.getSessionStorage();
    if (personalObjectId.length > 0) {
      Gallery.showPersonalGallery();
      personalObjectId.forEach((objectId) => {
        personalGalleryDetails = Gallery.fetchEachImageDetails(
          objectId,
          personalResultData
        ).then((data) => {
          if (data.length > 0) {
            data = data.slice(0, 25);
            const tiles = document.getElementById('personal-gallery-list');
            tiles.innerHTML = '';
            data.forEach((d, i) => {
              tiles.innerHTML += `
            <article class="section-gallery--card">
              <div class="card-image-section">
                <div class="section-gallery--card-image" style="background-image: url('${d.primaryImageSmall}')">
                </div>             
              </div>           
              <div class="card-text-section">
                <h2>${d.title}</h2>
                <h3>Artist: ${d.artistDisplayName}</h3>
                <a href="${d.objectURL}" target="_blank" class="read-more">Read More <span>&raquo;</span></a>
              </div>
            </article>
            `;
            });
            Gallery.removeLoader();
          }
        });
      });
    }
  }

  // Save Personal Gallery
  static savePersonalGallery() {
    const checkboxes = document.querySelectorAll(
      'input[type="checkbox"]:checked'
    );
    const formGallery = document.getElementById('form-gallery');
    let selectedImages = [];

    if (checkboxes.length > 0) {
      if (checkboxes.length > 5) {
        alert('Select less than 5 Images.');
        return false;
      }

      checkboxes.forEach((s) => {
        selectedImages.push(s.value);
      });

      Gallery.setSessionStorage(selectedImages);

      formGallery.reset();

      Gallery.displayPersonalGallery();
    }
  }

  // Create Main Gallery Template
  static createGalleryTemplate(galleryDetails) {
    galleryDetails.then((data) => {
      if (data.length > 0) {
        data = data.slice(0, 25);
        const tiles = document.getElementById('main-gallery-list');
        tiles.innerHTML = '';
        data.forEach((d, i) => {
          tiles.innerHTML += `
            <article class="section-gallery--card">
              <div class="card-image-section">
                <div class="section-gallery--card-image" style="background-image: url('${d.primaryImageSmall}')">
                </div>             
              </div>           
              <div class="card-text-section">
                <h2>${d.title}</h2>
                <h3>Artist: ${d.artistDisplayName}</h3>
                <div class="card-checkbox">
                  <input type="checkbox" class="checkbox" name="selectedImage[${i}]" value="${d.objectID}">
                </div>
                <a href="${d.objectURL}" target="_blank" class="read-more">Read More <span>&raquo;</span></a>
              </div>
            </article>
            `;
        });
        tiles.innerHTML += `
          <div class="btn--submit">
            <input type="submit" class="btn btn--solid" value="Save to Personal Gallery" />
          </div>`;
        Gallery.removeLoader();
      }
    });
  }

  // Remove Loader If Exist
  static removeLoader() {
    if (document.contains(document.querySelector('.loading'))) {
      document.querySelector('.loading').remove();
    }
  }

  // Show Main Gallery
  static showMainGallery() {
    document.getElementById('main-gallery-list').classList.remove('hide');
    document.getElementById('personal-gallery-list').classList.add('hide');

    document.getElementById('btn-main').classList.add('active');
    document.getElementById('btn-personal').classList.remove('active');
  }

  // Show Personal Gallery
  static showPersonalGallery() {
    document.getElementById('personal-gallery-list').classList.remove('hide');
    document.getElementById('main-gallery-list').classList.add('hide');

    document.getElementById('btn-personal').classList.add('active');
    document.getElementById('btn-main').classList.remove('active');
  }

  // Get Session Storage Data
  static getSessionStorage() {
    return JSON.parse(sessionStorage.getItem('personalGallery'));
  }

  // Set Session Storage Data
  static setSessionStorage(selectedImages) {
    sessionStorage.setItem('personalGallery', JSON.stringify(selectedImages));
  }
}

// Event: Onload Display Main Gallery
document.addEventListener('DOMContentLoaded', Gallery.displayMainGalleryList);

//Event: OnClick Display Main Gallery
document
  .querySelector('#btn-main')
  .addEventListener('click', Gallery.showMainGallery);

//Event: Onclick Display Personal Gallery
document
  .querySelector('#btn-personal')
  .addEventListener('click', Gallery.displayPersonalGallery);

//Event: Add Images in Personal Gallery
document.querySelector('#form-gallery').addEventListener('submit', (e) => {
  e.preventDefault();
  Gallery.savePersonalGallery();
});
