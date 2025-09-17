const API_KEY = "40105c0059f7df2bca66fb278c5d9a21";
const GENRE_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=tr-TR`;
const BASE_URL = "https://api.themoviedb.org/3/discover/movie";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDER = "https://via.placeholder.com/300x450?text=No+Image";

const kategoriSelect = document.getElementById("kategori");
const robotForm = document.getElementById("robotForm");
const resultsDiv = document.getElementById("results");

// Genre'leri yükle
async function loadGenres() {
  try {
    const res = await fetch(GENRE_URL);
    const data = await res.json();
    kategoriSelect.innerHTML = `<option value="">Kategori Seç</option>` +
      data.genres.map(g => `<option value="${g.id}">${g.name}</option>`).join("");
  } catch (err) {
    console.error("loadGenres error:", err);
  }
}

// Form submit
robotForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const kategori = document.getElementById("kategori").value;
  const puan = document.getElementById("puan").value;
  const yilBas = document.getElementById("yilBaslangic").value;
  const yilBit = document.getElementById("yilBitis").value;

  resultsDiv.innerHTML = `<p>🔎 Filmler getiriliyor...</p>`;

  let url = `${BASE_URL}?api_key=${API_KEY}&language=tr-TR&sort_by=popularity.desc&include_adult=false&page=1`;

  if (kategori) url += `&with_genres=${kategori}`;
  if (puan) url += `&vote_average.gte=${puan}`;
  if (yilBas) url += `&primary_release_date.gte=${yilBas}-01-01`;
  if (yilBit) url += `&primary_release_date.lte=${yilBit}-12-31`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = `<p>⚠️ Uygun film bulunamadı.</p>`;
      return;
    }

    resultsDiv.innerHTML = "";
    data.results.forEach(movie => {
      const poster = movie.poster_path ? IMAGE_BASE + movie.poster_path : PLACEHOLDER;
      const title = movie.title || "Başlık yok";
      const vote = movie.vote_average ? movie.vote_average.toFixed(1) : "—";
      const year = movie.release_date ? ` (${movie.release_date.slice(0, 4)})` : "";

      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <img src="${poster}" alt="${title}">
        <h3>${title}${year}</h3>
        <span>IMDB benzeri: ${vote}</span>
      `;
      resultsDiv.appendChild(card);
    });
  } catch (error) {
    resultsDiv.innerHTML = `<p>❌ Hata oluştu.</p>`;
    console.error(error);
  }
});

// Başlat
loadGenres();
