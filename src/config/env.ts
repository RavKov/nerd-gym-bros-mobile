const FALLBACK_API_BASE_URL = "http://10.0.2.2:8000";

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL).replace(
  /\/$/,
  ""
);

// export const API_BASE_URL_THUMBNAILS = `${API_BASE_URL}/media/thumbnails`;
// export const API_BASE_URL_VIDEOS = `${API_BASE_URL}/media/videos`;

export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || "";