import {apiConfig} from '../config/environment';
import type {NewsAPIResponse} from '../types/news';

/**
 * News API service client
 * Fetches football news from the backend API
 */

/**
 * Fetches football news articles from the backend API
 * @returns Promise resolving to NewsAPIResponse
 * @throws Error if the API request fails
 */
export const fetchFootballNews = async (): Promise<NewsAPIResponse> => {
  const url = `${apiConfig.baseURL}/news/football`;
  console.log('[fetchFootballNews] Requesting:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...apiConfig.headers,
      },
    });

    console.log('[fetchFootballNews] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[fetchFootballNews] Error response:', errorText);
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data: NewsAPIResponse = await response.json();
    console.log('[fetchFootballNews] Success, received', data.articles?.length || 0, 'articles');
    return data;
  } catch (error) {
    console.error(`[fetchFootballNews] Request failed for ${url}:`, error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check if the backend is running.');
    }
    throw error;
  }
};

