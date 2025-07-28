/*
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/
function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length == 2)
		return parts.pop().split(';').shift();
}
function getPlaceIdFromURL() {
	const params = new URLSearchParams(window.location.search);
	return params.get("id");
}
function checkAuthentification() {
	const token = getCookie("token");
	const loginlink = document.getElementById("login-link");
	if (loginlink) {
		loginlink.style.display = token ? "none" : "block";
	}
	if (token) {
	fetchPlaces(token);
	}
	const logoutLink = document.getElementById("logout-link");
	if (logoutLink) {
		logoutLink.style.display = token ? "inline-block" : "none";

		logoutLink.addEventListener('click', (e) => {
		e.preventDefault();
		document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
		window.location.reload();
	});
}

}
function setupFilter() {
	const filterSelect = document.getElementById('price-filter');
	if (!filterSelect) return;

	filterSelect.addEventListener('change', () =>{
		const selecValue = filterSelect.value;
		const placeCards = document.querySelectorAll('.place-card');

		placeCards.forEach(card => {
			const price = parseFloat(card.getAttribute('data-price'));

			if (selecValue == 'all' || price <= parseFloat(selecValue)) {
				card.classList.remove('hidden');
			} else {
				card.classList.add('hidden');
			}
		});
	})
}
async function fetchPlaceDetails(token, placeId) {
	const url = `http://127.0.0.1:5000/api/v1/places/${placeId}`;
	const response = await fetch(url, {
		method: 'GET',
		headers: {
		Authorization: `Bearer ${token}`
		}
	});
	if (response.ok) {
    	const place = await response.json();
    	displayPlaceDetails(place);
		}
	else {
		console.error("Erreur lors de la récupération du lieu :", response.status);
	}
}
async function fetchPlaces(token) {
	try {
		const response = await fetch('http://127.0.0.1:5000/api/v1/places/', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error('Erreur lors de la récupération des lieux');
		}

		const places = await response.json();

		displayPlaces(places);
		setupFilter();
	} catch (error) {
		console.error('Erreur lors de la récupération des lieux:', error.message);
	}
}
function displayPlaces(places) {
	const placesList = document.getElementById('places-list');
	if (!placesList) return;

	placesList.innerHTML = '';

	places.forEach(place => {
		const placeCard = document.createElement('div');
		placeCard.classList.add('place-card');
		placeCard.setAttribute('data-price', place.price);

		placeCard.innerHTML = `
			<h3>${place.title || place.name || 'No title'}</h3>
			<p>${place.description || ''}</p>
			<p><strong>Price:</strong> ${place.price} €</p>
			<a href="/place?id=${place.id}" class="details-button">View Details</a>
		`;

		placesList.appendChild(placeCard);
	});
}
function displayPlaceDetails(place) {
    const titleEl = document.getElementById("place-title");
    const descriptionEl = document.getElementById("place-description");
    const priceEl = document.getElementById("place-price");
    const hostEl = document.getElementById("place-host");
    const amenitiesEl = document.getElementById("place-amenities");
    const reviewsEl = document.getElementById("place-reviews");

    if (titleEl) titleEl.textContent = place.title || place.name || 'No title';
    if (descriptionEl) descriptionEl.textContent = place.description || '';
    if (priceEl) priceEl.textContent = `${place.price} € per night`;

    // CORRECTION: Enlevez "Host:" du JavaScript car il est déjà dans le HTML
    if (hostEl) hostEl.textContent = `${place.host?.first_name || 'Unknown'} ${place.host?.last_name || ''}`;

    // CORRECTION: Afficher les amenities dans une liste
    if (amenitiesEl && place.amenities && place.amenities.length > 0) {
        amenitiesEl.innerHTML = '<h3>Amenities:</h3>';
        const amenitiesList = document.createElement('ul');
        place.amenities.forEach(amenity => {
            const li = document.createElement('li');
            li.textContent = amenity.name;
            amenitiesList.appendChild(li);
        });
        amenitiesEl.appendChild(amenitiesList);
    } else if (amenitiesEl) {
        amenitiesEl.innerHTML = '<h3>Amenities:</h3><p>No amenities listed</p>';
    }

    // Afficher les reviews
    if (reviewsEl && place.reviews && place.reviews.length > 0) {
        reviewsEl.innerHTML = '<h3>Reviews:</h3>';
        place.reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.classList.add('review-card');
            reviewCard.innerHTML = `
                <p><strong>${review.user?.first_name || 'Anonymous'}</strong></p>
                <p>${review.text}</p>
                <p>Rating: ${review.rating}/5</p>
            `;
            reviewsEl.appendChild(reviewCard);
        });
    } else if (reviewsEl) {
        reviewsEl.innerHTML = '<h3>Reviews:</h3><p>No reviews yet</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = document.cookie.includes('token=');
    const currentPage = window.location.pathname;

    // Gérer la page place
    if (currentPage === '/place') {
        const token = getCookie("token");
        const placeId = getPlaceIdFromURL();

        if (token && placeId) {
            fetchPlaceDetails(token, placeId);
        }

        const addReviewSection = document.getElementById('add-review');
        if (addReviewSection) {
            addReviewSection.style.display = isLoggedIn ? 'block' : 'none';
        }
    }

    // Gérer la page add_review
    if (currentPage === '/add_review') {
        if (!isLoggedIn) {
            window.location.href = '/';
            return;
        }

        const token = getCookie("token");
        const placeId = getPlaceIdFromURL();

        if (token && placeId) {
            fetchPlaceDetails(token, placeId);
        }
    }

    // Gestion du formulaire de login
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
				window.location.href = '/';
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

	checkAuthentification();
});
