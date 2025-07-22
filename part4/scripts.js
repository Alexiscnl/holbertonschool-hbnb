/*
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

document.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = true; // à changer plus tard dynamiquement

  // On cible les éléments uniquement sur la page 'place.html'
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage !== 'place.html' && currentPage !== 'add_review.html') return;

  const reviewForm = document.querySelector('.form');
  const reviewLink = document.querySelector('.details-button');

  if (!reviewForm || !reviewLink) return;

  if (isLoggedIn) {
    reviewForm.style.display = 'block';
    reviewLink.style.display = 'none';
  } else {
    reviewForm.style.display = 'none';
    reviewLink.style.display = 'inline-block';
  }
});
