/**
 * HBnB Web Interface - JavaScript Functionality
 * Handles authentication, place browsing, place details, and review functionality
 */

/**
 * Retrieves a cookie value by name
 * @param {string} name - The name of the cookie to retrieve
 * @returns {string|undefined} The cookie value or undefined if not found
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length == 2)
        return parts.pop().split(';').shift();
}

/**
 * Extracts place ID from URL search parameters
 * @returns {string|null} The place ID from URL or null if not found
 */
function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

/**
 * Checks user authentication status and updates UI accordingly
 * Shows/hides login/logout links and fetches places if authenticated
 */
function checkAuthentification() {
    const token = getCookie("token");
    const loginlink = document.getElementById("login-link");

    // Toggle login link visibility
    if (loginlink) {
        loginlink.style.display = token ? "none" : "block";
    }

    // Fetch places if authenticated
    if (token) {
        fetchPlaces(token);
    }

    // Handle logout functionality
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.style.display = token ? "inline-block" : "none";

        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear authentication cookie
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
            window.location.reload();
        });
    }
}

/**
 * Sets up price filtering functionality for places list
 * Filters place cards based on selected maximum price
 */
function setupFilter() {
    const filterSelect = document.getElementById('price-filter');
    if (!filterSelect) return;

    filterSelect.addEventListener('change', () => {
        const selecValue = filterSelect.value;
        const placeCards = document.querySelectorAll('.place-card');

        // Filter place cards based on price
        placeCards.forEach(card => {
            const price = parseFloat(card.getAttribute('data-price'));

            if (selecValue == 'all' || price <= parseFloat(selecValue)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
}

/**
 * Fetches detailed information for a specific place and its reviews
 * @param {string} token - JWT authentication token
 * @param {string} placeId - Unique identifier for the place
 */
async function fetchPlaceDetails(token, placeId) {
    try {
        // Fetch place details from API
        const placeResponse = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (placeResponse.ok) {
            const place = await placeResponse.json();
            displayPlaceDetails(place);
        }

        // Fetch reviews for the place (no authentication required for reading)
        const reviewsResponse = await fetch(`http://127.0.0.1:5000/api/v1/reviews/places/${placeId}/reviews`, {
            method: 'GET'
        });

        if (reviewsResponse.ok) {
            const reviews = await reviewsResponse.json();
            displayReviews(reviews);
        }

    } catch (error) {
        console.error('Error fetching place details:', error);
    }
}

/**
 * Fetches all available places from the API
 * @param {string} token - JWT authentication token
 */
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

/**
 * Displays list of places in the UI
 * Creates place cards with basic information and view details button
 * @param {Array} places - Array of place objects from API
 */
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

/**
 * Displays detailed information for a specific place
 * Updates DOM elements with place title, description, price, host, and amenities
 * @param {Object} place - Place object containing detailed information
 */
function displayPlaceDetails(place) {
    const titleEl = document.getElementById("place-title");
    const descriptionEl = document.getElementById("place-description");
    const priceEl = document.getElementById("place-price");
    const hostEl = document.getElementById("place-host");
    const amenitiesEl = document.getElementById("place-amenities");
    const reviewsEl = document.getElementById("place-reviews");

    // Update basic place information
    if (titleEl) titleEl.textContent = place.title || place.name || 'No title';
    if (descriptionEl) descriptionEl.textContent = place.description || '';
    if (priceEl) priceEl.textContent = `${place.price} € per night`;

    // Display host information
    if (hostEl) hostEl.textContent = `${place.host?.first_name || 'Unknown'} ${place.host?.last_name || ''}`;

    // Display amenities as a bulleted list
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

    // Display reviews if included in place object (fallback display)
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

/**
 * Displays reviews for a place with enhanced formatting
 * Shows star ratings, dates, and review text in styled cards
 * @param {Array} reviews - Array of review objects from API
 */
function displayReviews(reviews) {
    const reviewsContainer = document.getElementById('place-reviews');
    if (!reviewsContainer) return;

    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p>No reviews yet.</p>';
        return;
    }

    // Create reviews section with count and formatted cards
    reviewsContainer.innerHTML = `
        <h3>Reviews (${reviews.length})</h3>
        <div class="reviews-list">
            ${reviews.map(review => `
                <div class="review-card">
                    <div class="review-header">
                        <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                        <span class="review-date">${new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="review-text">"${review.text}"</p>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Validates review form inputs
 * @param {string} review - Review text content
 * @param {string} rating - Rating value (1-5)
 * @returns {boolean} True if inputs are valid, false otherwise
 */
function validateReviewInputs(review, rating) {
    if (!review || !rating) {
        alert("Please fill in all fields");
        return false;
    }

    if (rating < 1 || rating > 5) {
        alert("Rating must be between 1 and 5");
        return false;
    }

    if (review.trim().length < 10) {
        alert("Review must be at least 10 characters long");
        return false;
    }

    return true;
}

/**
 * Submits a review to the API with proper error handling
 * @param {string} placeId - ID of the place being reviewed
 * @param {string} reviewText - Text content of the review
 * @param {number} rating - Rating value (1-5)
 * @returns {Promise<boolean>} Promise resolving to true if successful, false otherwise
 */
async function submitReview(placeId, reviewText, rating) {
    const token = getCookie("token");

    if (!token) {
        alert('Please log in to submit a review');
        window.location.href = '/login';
        return false;
    }

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/v1/reviews/places/${placeId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({text: reviewText, rating: parseInt(rating)}),
        });

        if (response.ok) {
            alert('Review submitted successfully!');
            return true;
        } else {
            // Handle different error scenarios
            const errorData = await response.json();
            let errorMessage = 'Failed to submit review';

            if (response.status === 400) {
                errorMessage = errorData.error || 'Invalid input data';
            } else if (response.status === 401) {
                errorMessage = 'Please log in to submit a review';
                window.location.href = '/login';
            } else if (response.status === 404) {
                errorMessage = 'Place not found';
            }

            alert(errorMessage);
            return false;
        }
    } catch (error) {
        alert('Network error: ' + error.message);
        return false;
    }
}

/**
 * Main DOM Content Loaded event handler
 * Initializes page-specific functionality based on current URL
 */
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = document.cookie.includes('token=');
    const currentPage = window.location.pathname;

    /**
     * Handle place details page functionality
     * Loads place information, reviews, and manages review form
     */
    if (currentPage === '/place') {
        const token = getCookie("token");
        const placeId = getPlaceIdFromURL();

        // Validate required parameters
        if (!placeId) {
            document.getElementById('place-title').textContent = 'Invalid place ID';
            return;
        }

        // Load place details if authenticated
        if (token && placeId) {
            fetchPlaceDetails(token, placeId);
        }

        // Show/hide review form based on authentication
        const addReviewSection = document.getElementById('add-review');
        if (addReviewSection) {
            addReviewSection.style.display = isLoggedIn ? 'block' : 'none';
        }

        /**
         * Handle review form submission on place details page
         */
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                // Get form data
                const review = document.getElementById('review-text').value.trim();
                const rating = document.getElementById('rating').value;

                // Validate inputs
                if (!validateReviewInputs(review, rating)) {
                    return;
                }

                // Submit review
                const success = await submitReview(placeId, review, rating);
                if (success) {
                    reviewForm.reset();
                    window.location.reload();
                }
            });
        }
    }

    /**
     * Handle dedicated add review page (legacy - should be removed)
     * @deprecated This functionality is now handled in the place details page
     */
    if (currentPage === '/add_review') {
        if (!isLoggedIn) {
            window.location.href = '/';
            return;
        }

        const token = getCookie("token");
        const placeId = getPlaceIdFromURL();

        const reviewForm = document.getElementById('review-form')
        if (reviewForm) {
            reviewForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const review = document.getElementById('review').value;
                const rating = document.getElementById('rating').value;

                if (!review || !rating) {
                    alert("Please fill in all fields");
                    return;
                }

                try {
                    const reviewResponse = await fetch(`http://127.0.0.1:5000/api/v1/reviews/places/${placeId}/reviews`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({text: review, rating: parseInt(rating)}),
                    })

                    if (reviewResponse.ok) {
                        alert('Review submitted successfully!');
                        reviewForm.reset();
                        window.location.href = `/place?id=${placeId}`;
                    } else {
                        alert('Failed to submit review');
                    }
                } catch (error) {
                    alert('Network error: ' + error.message);
                }
            })
        }
    }

    /**
     * Handle login form functionality
     * Processes user authentication and sets JWT token cookie
     */
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Get form credentials
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            // Clear previous error messages
            const errorDiv = document.getElementById('error-message');
            if (errorDiv) errorDiv.textContent = '';

            try {
                // Send authentication request
                const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password }),
                });

                if (response.ok) {
                    // Store JWT token and redirect to home
                    const data = await response.json();
                    document.cookie = `token=${data.access_token}; path=/; SameSite=Lax;`;
                    console.log("Cookies after setting:", document.cookie);
                    window.location.href = '/';
                } else {
                    // Display authentication error
                    const errorData = await response.json();
                    const errorMsg = errorData.error || 'Login failed';
                    if (errorDiv) errorDiv.textContent = errorMsg;
                    else alert(errorMsg);
                }
            } catch (error) {
                // Handle network errors
                if (errorDiv) errorDiv.textContent = 'Network error: ' + error.message;
                else alert('Network error: ' + error.message);
            }
        });
    }

    // Initialize authentication check
    checkAuthentification();
});
