/*
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

document.addEventListener('DOMContentLoaded', () => {
	const isLoggedIn = document.cookie.includes('token=');


  // ----------- Gestion du formulaire d'avis (place.html & add_review.html) ----------- //
  const currentPage = window.location.pathname.split('/').pop();

  if (currentPage === 'place.html' || currentPage === 'add_review.html') {
    const reviewForm = document.querySelector('.form');
    const reviewLink = document.querySelector('.details-button');

    if (reviewForm) reviewForm.style.display = isLoggedIn ? 'block' : 'none';
    if (reviewLink) reviewLink.style.display = isLoggedIn ? 'none' : 'inline-block';
  }

  // ----------- Gestion du formulaire de login (login.html) ----------- //
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = loginForm.email.value;
      const password = loginForm.password.value;

      const errorDiv = document.getElementById('error-message');
      if (errorDiv) errorDiv.textContent = '';

      try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          	const data = await response.json();
        	document.cookie = `token=${data.access_token}; path=/; SameSite=Lax;`;
            console.log("Cookies after setting:", document.cookie);
            window.location.href = '/index';
        }
		else {
          const errorData = await response.json();
          const errorMsg = errorData.error || 'Login failed';
          if (errorDiv) errorDiv.textContent = errorMsg;
          else alert(errorMsg);
        }
      } catch (error) {
        if (errorDiv) errorDiv.textContent = 'Network error: ' + error.message;
        else alert('Network error: ' + error.message);
      }
    });
  }
});
