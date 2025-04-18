// Logic to fetch data using supabaseClient.js and display it in the HTML

console.log("leaderboard.js loaded");

const leaderboardList = document.getElementById('leaderboard-list');
const refreshButton = document.getElementById('refreshLeaderboard');

async function displayLeaderboard() {
    if (!leaderboardList) return; // Exit if element doesn't exist

    leaderboardList.innerHTML = '<li>Loading...</li>'; // Show loading state

    const scores = await fetchLeaderboard(5); // Fetch top 5 scores

    leaderboardList.innerHTML = ''; // Clear loading/previous scores

    if (scores && scores.length > 0) {
        scores.forEach((score, index) => {
            const li = document.createElement('li');
            // Format time (e.g., from ms to seconds with 2 decimal places)
            const timeInSeconds = (score.time_ms / 1000).toFixed(2);
            li.textContent = `#${index + 1}: ${score.player_name} - ${timeInSeconds}s`;
            leaderboardList.appendChild(li);
        });
    } else if (supabase) { // Only show "No scores yet" if Supabase is configured
        leaderboardList.innerHTML = '<li>No scores yet!</li>';
    } else {
         leaderboardList.innerHTML = '<li>Leaderboard disabled.</li>'; // Message if Supabase isn't configured
    }
}

// Add event listener to the refresh button
if (refreshButton) {
    refreshButton.addEventListener('click', displayLeaderboard);
} else {
    console.warn("Refresh leaderboard button not found.");
}

// Initial display of the leaderboard when the script loads
document.addEventListener('DOMContentLoaded', () => {
    // Ensure Supabase client might be ready (though it's async)
    // A small delay might help in simple cases, but ideally wait for client init signal
    setTimeout(displayLeaderboard, 100); 
}); 