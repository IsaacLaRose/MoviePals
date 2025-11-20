import api from "./api";

// Add or update a favorite
export async function addFavorite(data) {
  const res = await api.post("/api/addFavorite", data);
  return res.data;
}

// Remove a favorite
export async function removeFavorite(userId, tmdbId) {
  const res = await api.post("/api/removeFavorite", { userId, tmdbId });
  return res.data;
}

// Get all favorites for a user
export async function getFavorites(userId) {
  const res = await api.post("/api/getFavorites", { userId });
  return res.data.favorites;
}