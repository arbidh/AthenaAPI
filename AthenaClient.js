const axios = require('axios');

// Configuration: update via environment variables or edit these defaults
const CLIENT_ID = process.env.ATHENA_CLIENT_ID || 'REPLACE_WITH_CLIENT_ID';
const CLIENT_SECRET = process.env.ATHENA_CLIENT_SECRET || 'REPLACE_WITH_CLIENT_SECRET';
const ATHENA_ENV = (process.env.ATHENA_ENV || 'production').toLowerCase(); // 'preview' or 'production'
const PRACTICE_ID = process.env.ATHENA_PRACTICE_ID || undefined;

const BASE_URL = ATHENA_ENV === 'preview'
  ? 'https://api.preview.platform.athenahealth.com'
  : 'https://api.platform.athenahealth.com';

let tokenCache = null;
let tokenExpiry = 0;

const getBaseUrl = () => BASE_URL;
const getPracticeId = (fallback) => (PRACTICE_ID || fallback);

const getToken = async () => {
  if (tokenCache && Date.now() < tokenExpiry - 10000) {
    return tokenCache;
  }

  // If credentials aren't provided, return a safe local stub token so
  // tests can run offline. To call real Athena, set ATHENA_CLIENT_ID and
  // ATHENA_CLIENT_SECRET in your environment.
  if (!CLIENT_ID || CLIENT_ID === 'REPLACE_WITH_CLIENT_ID' || !CLIENT_SECRET || CLIENT_SECRET === 'REPLACE_WITH_CLIENT_SECRET') {
    console.warn('ATHENA_CLIENT_ID/ATHENA_CLIENT_SECRET not provided — returning STUB token for local testing');
    if (tokenCache && Date.now() < tokenExpiry - 10000) {
      return tokenCache;
    }
    tokenCache = {
      access_token: 'stubbed-access-token',
      token_type: 'bearer',
      expires_in: 300,
      scope: 'athena/service/Athenanet.MDP.*'
    };
    tokenExpiry = Date.now() + (tokenCache.expires_in * 1000);
    return tokenCache;
  }

  const url = `${BASE_URL}/oauth2/v1/token`;
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  // Request the service scope required by Athena
  params.append('scope', 'athena/service/Athenanet.MDP.*');

  try {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const res = await axios.post(url, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basic}`,
      },
      timeout: 15000,
    });

    if (!res.data || !res.data.access_token) throw new Error('No access_token returned');

    tokenCache = res.data;
    tokenExpiry = Date.now() + ((res.data.expires_in || 3600) * 1000);
    return tokenCache;
  } catch (err) {
    // If axios returned a response body, include its JSON so errors are actionable
    if (err.response && err.response.data) {
      const body = typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : String(err.response.data);
      throw new Error(`Failed to obtain token: ${body}`);
    }
    throw new Error(`Failed to obtain token: ${err.message || err}`);
  }
};

module.exports = {
  getToken,
  getBaseUrl,
  getPracticeId,
};
