(async function fetchMainGalleryData() {
  let url =
    'https://collectionapi.metmuseum.org/public/collection/v1/search?q=sunflowers';

  let result = await fetch(url, {
    method: 'get',
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (responseObject) {
      var objectIds = responseObject.objectIDs;
      let resultData = [];
      let resultDataObj = [];
      objectIds.forEach((objectId) => {
        resultDataObj = fetchEachImageDetails(objectId, resultData);
      });
      resultDataObj.then(function (data) {
        if (data.length > 0) {
          data = data.slice(0, 25);
          let temp = '';
          data.forEach((d, i) => {
            temp += `<article class="section-gallery--card">
            <div class="card-image-section">
                <div class="section-gallery--card-image" style="background-image: url('${d.primaryImageSmall}')"></div>
                </div>             
            </div>           
            <div class="card-text-section">
              <h2>${d.title}</h2>
              <h3>Artist: ${d.artistDisplayName}</h3>
              <div class="card-checkbox"><input type="checkbox" class="checkbox" name="selectedImage[${i}]" value="${d.objectID}"></div>
              <a href="${d.objectURL}" target="_blank" class="read-more">Read More <span>&raquo;</span></a>
            </div>
          </article>`;
          });
          temp += `<div class="btn--submit"><input
          type="submit"
          class="btn btn--solid"
          value="Save to Personal Gallery"
        /></div>`;
          document.getElementById('data').innerHTML = temp;
        }
      });
    })
    .catch(function (error) {
      console.log('Request failed', error);
    });
})();

async function fetchMyPersonalGalleryData() {
  let resultData = [];
  let personalGalleryData;
  let objectIds = JSON.parse(sessionStorage.getItem('personalGallery'));
  document.getElementById('personalData').innerHTML =
    '<div class="loading"></div>';
  objectIds.forEach((objectId) => {
    personalGalleryData = fetchEachImageDetails(objectId, resultData)
      .then((data) => {
        if (data.length > 0) {
          let tempData = '';
          data.forEach((d) => {
            tempData += `<article class="section-gallery--card">
            <div class="card-image-section">
                <div class="section-gallery--card-image" style="background-image: url('${d.primaryImageSmall}')"></div>
                </div>             
            </div>           
            <div class="card-text-section">
              <h2>${d.title}</h2>
              <h3>Artist: ${d.artistDisplayName}</h3>              
              <a href="${d.objectURL}" target="_blank" class="read-more">Read More <span>&raquo;</span></a>
            </div>
          </article>`;
          });
          document.getElementById('personalData').innerHTML = tempData;
          displayMyPersonalGallery();
        }
      })
      .catch(function (error) {
        console.log('Request failed', error);
      });
  });
}

function toggleMenu(data) {
  if (data === 'main') {
    displayMainGallery();
  }
  if (data === 'personal') {
    fetchMyPersonalGalleryData();
  }
}

function savePersonalGallery(e) {
  e.preventDefault();
  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"]:checked'
  );
  if (checkboxes.length > 0) {
    if (checkboxes.length > 5) {
      alert('Select less than 5 Images.');
      return false;
    }
    let selectedImages = [];
    checkboxes.forEach((s) => {
      selectedImages.push(s.value);
    });
    sessionStorage.setItem('personalGallery', JSON.stringify(selectedImages));
    document.getElementById('form-gallery').reset();
    toggleMenu('personal');
  }
}

async function fetchEachImageDetails(objectId, resultData) {
  return await fetch(
    'https://collectionapi.metmuseum.org/public/collection/v1/objects/' +
      objectId,
    {
      method: 'get',
    }
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (responseObject) {
      resultData.push(responseObject);
      return resultData;
    });
}

function displayMainGallery() {
  document.getElementById('data').classList.remove('hide');
  document.getElementById('personalData').classList.add('hide');

  document.getElementById('btn-main').classList.add('active');
  document.getElementById('btn-personal').classList.remove('active');
}

function displayMyPersonalGallery() {
  document.getElementById('personalData').classList.remove('hide');
  document.getElementById('data').classList.add('hide');

  document.getElementById('btn-personal').classList.add('active');
  document.getElementById('btn-main').classList.remove('active');
}
