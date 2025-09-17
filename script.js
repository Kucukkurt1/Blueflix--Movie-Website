document.addEventListener('DOMContentLoaded', () => {

  const API_KEY = "40105c0059f7df2bca66fb278c5d9a21";

  /* ========== HERO SLIDER ========== */
  const slider = document.querySelector('.hero-slider');
  let currentSlide = 0;
  let slides = [];

  const movieIDs = [
    { id: 1405, type: 'tv' },
    { id: 1933, type: 'movie' },
    { id: 70523, type: 'tv' },
    { id: 141, type: 'movie' },
    { id: 1417, type: 'movie' }
  ];

  if (slider) {
    Promise.all(
      movieIDs.map(({ id, type }) =>
        fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}&language=tr`).then(res => res.json())
      )
    ).then(filmler => {
      filmler.forEach((film, index) => {
        const slide = document.createElement('div');
        slide.classList.add('hero-slide');
        slide.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${film.poster_path})`;
        slide.style.left = index === 0 ? '0' : '100%';

        const imdbRating = film.vote_average ? film.vote_average.toFixed(1) : 'N/A';
        const year = film.release_date ? film.release_date.split('-')[0] : film.first_air_date ? film.first_air_date.split('-')[0] : '';

        slide.innerHTML = `
          <div class="hero-content">
            <h1>${film.title || film.name}</h1>
            <div class="movie-info">
              <span class="year">${year}</span>
              <span class="genre">${film.genres.map(g => g.name).join(', ')}</span>
              <span class="rating">⭐ ${imdbRating}</span>
            </div>
            <p class="movie-overview">${film.overview}</p>
          </div>
          <button class="watch-btn">İZLE</button>
        `;

        slider.appendChild(slide);
        slides.push(slide);
      });

      const prevBtn = slider.querySelector('.prev') || document.createElement('button');
      prevBtn.classList.add('prev');
      prevBtn.innerHTML = '&#10094;';
      slider.appendChild(prevBtn);

      const nextBtn = slider.querySelector('.next') || document.createElement('button');
      nextBtn.classList.add('next');
      nextBtn.innerHTML = '&#10095;';
      slider.appendChild(nextBtn);

      function showSlide(newIndex, direction) {
        if (newIndex === currentSlide) return;
        const current = slides[currentSlide];
        const next = slides[newIndex];
        next.style.transition = 'none';
        next.style.left = direction === "next" ? '100%' : '-100%';
        requestAnimationFrame(() => {
          current.style.transition = 'left 0.6s ease';
          next.style.transition = 'left 0.6s ease';
          current.style.left = direction === "next" ? '-100%' : '100%';
          next.style.left = '0';
          currentSlide = newIndex;
        });
      }

      prevBtn.addEventListener('click', () => {
        const newIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(newIndex, "prev");
      });

      nextBtn.addEventListener('click', () => {
        const newIndex = (currentSlide + 1) % slides.length;
        showSlide(newIndex, "next");
      });

    }).catch(err => console.error("Filmleri çekme hatası:", err));
  }

  /* ========== LISTEM SLIDER ========== */
  const myListSlider = document.getElementById("my-list-slider");
  const myListPrev = document.getElementById("my-list-prev");
  const myListNext = document.getElementById("my-list-next");
  const myList = []; // Kullanıcının eklediği filmler için array
  const scrollAmount = 300;

  function addToMyList(movie) {
    if (myList.some(m => m.id === movie.id)) return; // Aynı filmi tekrar ekleme
    myList.push(movie);

    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
      <p class="movie-title">${movie.title}</p>
      <button class="remove-btn">×</button>
    `;

    // × buton ile çıkarma
    card.querySelector('.remove-btn').addEventListener('click', () => {
      card.remove();
      const index = myList.findIndex(m => m.id === movie.id);
      if (index > -1) myList.splice(index, 1);
    });

    myListSlider.appendChild(card);
  }

  if (myListPrev && myListNext && myListSlider) {
    myListNext.addEventListener("click", () => {
      if (myListSlider.scrollLeft + myListSlider.clientWidth >= myListSlider.scrollWidth) {
        // listenin sonuna gelince başa dön
        myListSlider.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        myListSlider.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    });

    myListPrev.addEventListener("click", () => {
      if (myListSlider.scrollLeft === 0) {
        // başa gelince sona git
        myListSlider.scrollTo({ left: myListSlider.scrollWidth, behavior: "smooth" });
      } else {
        myListSlider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    });
  }

  /* ========== POPÜLER SLIDER ========== */
  const popularSlider = document.getElementById("popular-slider");
  if (popularSlider) {
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=tr&page=1`)
      .then(res => res.json())
      .then(data => {
        const selected = data.results.slice(0, 15);
        selected.forEach(item => {
          const card = document.createElement('div');
          card.classList.add('movie-card');
          card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${item.poster_path}" alt="${item.title}">
            <p class="movie-title">${item.title}</p>
            <button class="add-btn">+</button>
          `;
          card.querySelector('.add-btn').addEventListener('click', () => addToMyList(item));
          popularSlider.appendChild(card);
        });

        const prevBtn = document.getElementById("popular-prev");
        const nextBtn = document.getElementById("popular-next");

        if (prevBtn && nextBtn) {
          nextBtn.addEventListener('click', () => {
            if (popularSlider.scrollLeft + popularSlider.clientWidth >= popularSlider.scrollWidth) {
              popularSlider.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
              popularSlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
          });

          prevBtn.addEventListener('click', () => {
            if (popularSlider.scrollLeft === 0) {
              popularSlider.scrollTo({ left: popularSlider.scrollWidth, behavior: 'smooth' });
            } else {
              popularSlider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
          });
        }
      })
      .catch(err => console.error("Popüler filmler yüklenemedi:", err));
  }

  /* ========== KATEGORİ SLIDERLARI ========== */
  const categories = [
    { id: "horror-slider", genre: 27 },
    { id: "thriller-slider", genre: 53 },
    { id: "drama-slider", genre: 18 },
    { id: "comedy-slider", genre: 35 },
    { id: "scifi-slider", genre: 878 }
  ];

  categories.forEach(cat => {
    const slider = document.getElementById(cat.id);
    if (!slider) return;

    fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${cat.genre}&language=tr&page=1`)
      .then(res => res.json())
      .then(data => {
        const selected = data.results.slice(0, 15);
        selected.forEach(item => {
          const card = document.createElement('div');
          card.classList.add('movie-card');
          card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${item.poster_path}" alt="${item.title}">
            <p class="movie-title">${item.title}</p>
            <button class="add-btn">+</button>
          `;
          card.querySelector('.add-btn').addEventListener('click', () => addToMyList(item));
          slider.appendChild(card);
        });

        const prevBtn = slider.parentElement.querySelector('.prev');
        const nextBtn = slider.parentElement.querySelector('.next');

        if (prevBtn && nextBtn) {
          nextBtn.addEventListener('click', () => {
            if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
              slider.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
              slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
          });

          prevBtn.addEventListener('click', () => {
            if (slider.scrollLeft === 0) {
              slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
            } else {
              slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
          });
        }
      })
      .catch(err => console.error(`Kategori ${cat.id} filmleri yüklenemedi:`, err));
  });


});