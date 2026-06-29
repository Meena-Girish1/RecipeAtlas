import axios from 'axios';

/**
 * Single axios instance for every backend call. Base URL is empty so
 * requests like api.get('/api/recipes') are sent as relative paths — Vite's
 * dev proxy (see vite.config.js) forwards them to the Express server, and
 * in production they're simply same-origin if the frontend build is served
 * by the same domain/reverse proxy as the API.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
});

// --- Recipes -----------------------------------------------------------
export const getLatestRecipes = (limit = 8) =>
  api.get('/api/recipes/latest', { params: { limit } }).then((r) => r.data);

export const searchRecipes = ({ q, tags, country, state } = {}) =>
  api
    .get('/api/recipes/search', {
      params: {
        q: q || undefined,
        tags: tags && tags.length ? tags.join(',') : undefined,
        country,
        state,
      },
    })
    .then((r) => r.data);

export const getRecipeById = (id) => api.get(`/api/recipes/${id}`).then((r) => r.data);

export const getSimilarRecipes = (id) => api.get(`/api/recipes/${id}/similar`).then((r) => r.data);

export const createRecipe = (formData) =>
  api
    .post('/api/recipes', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);

export const updateRecipe = (id, formData) =>
  api
    .put(`/api/recipes/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);

export const deleteRecipe = (id) => api.delete(`/api/recipes/${id}`).then((r) => r.data);

// --- Locations -----------------------------------------------------------
export const getCountries = () => api.get('/api/locations/countries').then((r) => r.data);

export const getStatesByCountry = (country) =>
  api.get(`/api/locations/countries/${encodeURIComponent(country)}/states`).then((r) => r.data);

export const getRecipesByState = (country, state) =>
  api
    .get(
      `/api/locations/countries/${encodeURIComponent(country)}/states/${encodeURIComponent(state)}/recipes`
    )
    .then((r) => r.data);

// --- Tags -----------------------------------------------------------
export const getTags = () => api.get('/api/tags').then((r) => r.data);

// --- AI -----------------------------------------------------------
export const suggestTags = (payload) => api.post('/api/ai/generate-tags', payload).then((r) => r.data);

export const suggestSummary = (payload) =>
  api.post('/api/ai/generate-summary', payload).then((r) => r.data);

export default api;
