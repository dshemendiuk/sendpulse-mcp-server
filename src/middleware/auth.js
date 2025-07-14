const authenticate = (req, res, next) => {
  // Skip authentication for /api endpoint
  if (req.path === '/api') {
    return next();
  }

  const apiKey = req.headers['x-api-key'];
  const apiSecret = req.headers['x-api-secret'];

  if (!apiKey || !apiSecret) {
    return res.status(401).json({ 
      success: false, 
      message: 'API Key and API Secret are required in headers' 
    });
  }

  // Store credentials in request for later use
  req.credentials = { apiKey, apiSecret };
  next();
};

module.exports = authenticate;
