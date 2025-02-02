const places = [
    "City Palace, Jaipur", "Fatehpur Sikri", "Hawa Mahal", "Lotus Temple", "Konark Sun Temple", "Red Fort", "Taj Mahal", "Gateway of India", "Ajanta Caves", "Ranthambore Fort",
    "Great Pyramid of Giza", "Abu Simbel", "Great Wall of China", "Terracotta Army", "Forbidden City",
    "Statue of Liberty", "Mount Rushmore", "Independence Hall", "Stonehenge", "Tower of London",
    "Big Ben", "Colosseum", "Leaning Tower of Pisa", "Eiffel Tower", "Palace of Versailles", "Himeji Castle",
    "Kinkaku-ji", "Chichen Itza", "Teotihuacan", "Parthenon", "Acropolis of Athens", "Delphi", "Hagia Sophia",
    "Machu Picchu", "Petra"
];

async function fetchWikipediaData(title) {
    const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|coordinates|info&titles=${title}&format=json&pithumbsize=500&exintro=1`
    )}`;

    try {
        const response = await axios.get(apiUrl);
        const data = JSON.parse(response.data.contents);
        const page = Object.values(data.query.pages)[0]; // Extract page data

        if (page) {
            return {
                title: page.title || title,
                image: page.thumbnail?.source || null,
                extract: page.extract || "No description available.",
                location: page.extract.match(/(?:located|found)\s+in\s+([A-Za-z\s]+)/) ? page.extract.match(/(?:located|found)\s+in\s+([A-Za-z\s]+)/)[1] : null,
                height: page.infobox?.height || null, // Check infobox for height
                built: page.infobox?.built || null, // Check infobox for built date
                architect: page.infobox?.architect || null, // Extract architect info from infobox
            };
        }
        console.warn(`No data found for ${title}`);
        return null;
    } catch (error) {
        console.error(`Error fetching data for ${title}:`, error);
        return null;
    }
}

async function showImageDetails(title) {
    const imageData = await fetchWikipediaData(title);
    if (imageData) {
        document.getElementById("modalImage").src =
            imageData.image || "https://via.placeholder.com/400x300?text=No+Image";
        document.getElementById("imageTitle").textContent = imageData.title;

        // Use innerHTML to render the full description with HTML tags
        document.getElementById("imageData").innerHTML = imageData.extract;

        // Populate the details only if available
        let imageDetails = "";
        if (imageData.location) {
            imageDetails += `<p><strong>Location:</strong> ${imageData.location}</p>`;
        }
        if (imageData.height) {
            imageDetails += `<p><strong>Height:</strong> ${imageData.height}</p>`;
        }
        if (imageData.built) {
            imageDetails += `<p><strong>Built:</strong> ${imageData.built}</p>`;
        }
        if (imageData.architect) {
            imageDetails += `<p><strong>Architect:</strong> ${imageData.architect}</p>`;
        }

        // Insert the details if any of them exist
        document.getElementById("imageDetails").innerHTML = imageDetails || "<p>No additional details available.</p>";

        const modal = new bootstrap.Modal(document.getElementById("imageModal"));
        modal.show();
    } else {
        document.getElementById("imageData").textContent = "No data found.";
    }
}

async function populateImageGrid(places) {
    const gridContainer = document.getElementById("image-grid");

    for (const place of places) {
        const col = document.createElement("div");
        col.classList.add("col");
        col.innerHTML = `
            <div class="card h-100">
                <img src="https://via.placeholder.com/300x200?text=Loading..." class="card-img-top" alt="${place}" id="img-${place}">
                <div class="card-body">
                    <h5 class="card-title">${place}</h5>
                    <button class="btn btn-primary" onclick="showImageDetails('${place}')">View Details</button>
                </div>
            </div>
        `;
        gridContainer.appendChild(col);

        // Fetch data for the place
        const data = await fetchWikipediaData(place);
        const imgElement = document.getElementById(`img-${place}`);
        if (data) {
            imgElement.src = data.image || "https://via.placeholder.com/300x200?text=No+Image";
        } else {
            console.warn(`No data or image found for ${place}`);
            imgElement.src = "https://via.placeholder.com/300x200?text=No+Image";
        }
    }
}

function searchPlace() {
    const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();

    // Check if the searched place exists in the list
    const foundPlace = places.find(place => place.toLowerCase() === searchTerm);

    if (foundPlace) {
        // If place found, fetch and display details in the modal
        showImageDetails(foundPlace);
    } else {
        alert("No matching place found. Please try again.");
    }
}

// Populate the grid with historical places
populateImageGrid(places);

window.onscroll = function() {
    var backToTopBtn = document.getElementById("backToTopBtn");
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
};
// Add JavaScript functions for handling API requests and displaying data
// Functionality remains unchanged from the original code
