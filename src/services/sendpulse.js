const axios = require('axios');
const FormData = require('form-data');

// Base URL for SendPulse API
const BASE_URL = 'https://api.sendpulse.com/chatbots';

// Cache for access tokens
let tokenCache = {
  token: null,
  expiresAt: 0
};

/**
 * Get an access token from SendPulse API
 * @param {string} clientId - SendPulse API Key
 * @param {string} clientSecret - SendPulse API Secret
 * @returns {Promise<string>} Access token
 */
async function getAccessToken(clientId, clientSecret) {
  // Check if we have a valid token in cache
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const form = new FormData();
  form.append('grant_type', 'client_credentials');
  form.append('client_id', clientId);
  form.append('client_secret', clientSecret);

  try {
    const response = await axios.post('https://api.sendpulse.com/oauth/access_token', form, {
      headers: form.getHeaders()
    });

    // Cache the token (expires in 1 hour, but we'll use 50 minutes to be safe)
    tokenCache = {
      token: response.data.access_token,
      expiresAt: Date.now() + (50 * 60 * 1000) // 50 minutes
    };

    return tokenCache.token;
  } catch (error) {
    console.error('Error getting access token:', error.message);
    throw new Error('Failed to authenticate with SendPulse API');
  }
}

/**
 * Make an authenticated request to SendPulse API
 * @private
 */
async function makeRequest(method, endpoint, clientId, clientSecret, params = {}) {
  try {
    const token = await getAccessToken(clientId, clientSecret);
    const url = `${BASE_URL}${endpoint}`;
    
    const config = {
      method,
      url,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (method.toLowerCase() === 'get') {
      config.params = params;
    } else {
      config.data = params;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in SendPulse API request to ${endpoint}:`, error.message);
    if (error.response) {
      // Forward the status code and error message from SendPulse
      const err = new Error(error.response.data.message || 'SendPulse API error');
      err.status = error.response.status;
      throw err;
    }
    throw error;
  }
}

/**
 * Get account information
 * @param {string} clientId - SendPulse API Key
 * @param {string} clientSecret - SendPulse API Secret
 * @returns {Promise<Object>} Account information
 */
async function getAccountInfo(clientId, clientSecret) {
  return makeRequest('get', '/account', clientId, clientSecret);
}

/**
 * Get list of bots
 * @param {string} clientId - SendPulse API Key
 * @param {string} clientSecret - SendPulse API Secret
 * @returns {Promise<Array>} List of bots
 */
async function getBots(clientId, clientSecret) {
  return makeRequest('get', '/bots', clientId, clientSecret);
}

/**
 * Get list of dialogs
 * @param {string} clientId - SendPulse API Key
 * @param {string} clientSecret - SendPulse API Secret
 * @param {Object} [options] - Query parameters
 * @param {number} [options.size] - Number of items per page
 * @param {number} [options.skip] - Number of items to skip
 * @param {string} [options.search_after] - ID of the element after which to search
 * @param {string} [options.order] - Sort order (asc/desc)
 * @returns {Promise<Object>} Paginated list of dialogs
 */
async function getDialogs(clientId, clientSecret, options = {}) {
  const params = {};
  
  if (options.size) params.size = options.size;
  if (options.skip) params.skip = options.skip;
  if (options.search_after) params.search_after = options.search_after;
  if (options.order) params.order = options.order;
  
  return makeRequest('get', '/dialogs', clientId, clientSecret, params);
}

module.exports = {
  getAccountInfo,
  getBots,
  getDialogs
};
