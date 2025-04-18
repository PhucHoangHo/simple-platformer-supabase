const SUPABASE_URL = 'https://vjgmzppvlwybtfwakdcx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZ216cHB2bHd5YnRmd2FrZGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Njc5NDYsImV4cCI6MjA2MDU0Mzk0Nn0.C_-6pvp5rEKx3c3zn0pC1aPFAqdOhPYm43D101aqN9k';

console.log("supabaseClient.js loaded");

let supabase = null;

// Initialize Supabase client immediately
if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    try {
      // Use the global supabase object provided by the CDN script
      // Check if the script actually loaded it
      if (window.supabase) {
          supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
          console.log("Supabase client initialized.");
      } else {
          console.error("Supabase library not found on window object.");
          throw new Error("Supabase library not loaded");
      }
    } catch (error) {
        console.error("Error initializing Supabase client:", error);
        supabase = null; // Ensure supabase is null if init fails
        const leaderboardDiv = document.getElementById('leaderboard');
        if (leaderboardDiv) {
          leaderboardDiv.innerHTML = '<p style="color: red;">Error initializing Supabase. Leaderboard disabled.</p>';
        }
    }
} else {
    console.warn("Supabase URL or Anon Key missing or still placeholders. Leaderboard features will be disabled.");
    const leaderboardDiv = document.getElementById('leaderboard');
    if (leaderboardDiv) {
      leaderboardDiv.innerHTML = '<p style="color: red;">Supabase not configured. Leaderboard disabled.</p>';
    }
}


// --- Leaderboard Functions ---

async function submitScore(playerName, timeMs) {
    if (!supabase) {
        console.warn("Cannot submit score, Supabase client not available.");
        alert("Leaderboard is not available.");
        return null;
    }
    
    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
        console.warn("Invalid player name provided.");
        alert("Please enter a valid name.");
        return null;
    }

    if (typeof timeMs !== 'number' || timeMs <= 0) {
        console.warn("Invalid time provided.");
        // Don't alert the user for this, it's an internal issue
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('scores') 
            .insert([
                { player_name: playerName.trim(), time_ms: timeMs }
            ])
            .select(); // Optionally select the inserted data if needed

        if (error) {
            console.error('Error submitting score:', error);
            alert(`Error submitting score: ${error.message}`);
            return null;
        }

        console.log('Score submitted successfully:', data);
        return data; // Return the submitted data (or true)
    } catch (error) {
        console.error('Caught error submitting score:', error);
        alert("An unexpected error occurred while submitting the score.");
        return null;
    }
}

async function fetchLeaderboard(limit = 5) {
     if (!supabase) {
        console.warn("Cannot fetch leaderboard, Supabase client not available.");
        return []; // Return empty array if Supabase isn't configured
    }

    try {
        const { data, error } = await supabase
            .from('scores')
            .select('player_name, time_ms')
            .order('time_ms', { ascending: true }) // Lower time is better
            .limit(limit);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            // Consider updating the UI to show an error
            return [];
        }

        console.log('Leaderboard fetched successfully:', data);
        return data || []; // Return data or empty array if null
    } catch (error) {
        console.error('Caught error fetching leaderboard:', error);
        // Consider updating the UI to show an error
        return [];
    }
} 