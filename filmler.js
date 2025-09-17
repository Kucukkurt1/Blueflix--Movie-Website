// ==================== TMDB API AYARLARI ====================
const API_KEY = "40105c0059f7df2bca66fb278c5d9a21";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

// ==================== SAYFA TİPİ (movie/tv) ====================
const type = document.body.dataset.type || "tv"; // diziler için tv

// ==================== KATEGORİLER ====================
const categoriesMovie = {
  "korku": 27,
  "gerilim": 53,
  "dram": 18,
  "komedi": 35,
  "aksiyon": 28,
  "bilim-kurgu": 878
};

const categoriesTv = {
  "polisiye": 80,   
  "gerilim": 9648,     
  "dram": 18,
  "komedi": 35,
  "aksiyon": 10759,
  "bilim-kurgu": 10765 
};

const categories = type === "movie" ? categoriesMovie : categoriesTv;

// ==================== API'DEN VERİ ÇEKME ====================
async function getItemsByGenre(genreId) {
  try {
    const url = `${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${genreId}&language=tr-TR&page=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API isteği başarısız!");
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Veri alınamadı:", error);
    return [];
  }
}

// ==================== EKRANA BASMA ====================
function displayItems(items, container) {
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `<p>Sonuç bulunamadı.</p>`;
    return;
  }

  items.forEach(item => {
    const title = type === "movie" ? item.title : item.name;
    const date = type === "movie" ? item.release_date : item.first_air_date;

    const card = document.createElement("div");
    card.classList.add("movie-card");
    card.innerHTML = `
      <img src="${item.poster_path ? IMG_URL + item.poster_path : 'https://via.placeholder.com/500x750'}" alt="${title}">
      <h3>${title}</h3>
      <span>${date ? date.split('-')[0] : ''}</span>
    `;
    container.appendChild(card);
  });
}

// ==================== SAYFA YÜKLENİNCE ====================
document.addEventListener("DOMContentLoaded", async () => {
  // Kategorileri doldur
  for (let category in categories) {
    const section = document.getElementById(category);
    if (!section) continue;
    const grid = section.querySelector(".movies-grid");
    const items = await getItemsByGenre(categories[category]);
    displayItems(items, grid);
  }

  // SEARCH BOX
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const searchResultsContainer = document.getElementById("search-results");
  const searchSection = document.getElementById("arama-sonuclari");
  const searchContainer = document.querySelector(".search-container");

  searchBtn.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if (!query) return;

    searchResultsContainer.innerHTML = "";

    try {
      const res = await fetch(`${BASE_URL}/search/${type}?api_key=${API_KEY}&language=tr&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      const results = data.results || [];

      // Kategorileri gizle
      document.querySelectorAll('#movies-container .movie-category').forEach(cat => cat.style.display = "none");

      // Arama sonuçları bölümünü göster
      searchSection.style.display = "block";

      // Scrollu search boxun üstüne aldım
      window.scrollTo({ top: searchContainer.offsetTop - 20, behavior: 'smooth' });

      displayItems(results, searchResultsContainer);

    } catch (err) {
      console.error(err);
      searchResultsContainer.innerHTML = "<p>Bir hata oluştu. Tekrar deneyin.</p>";
    }
  });

  // Entera basınca arama
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchBtn.click();
  });
});
