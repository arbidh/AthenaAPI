;(async () => {
  try {
    const ath = require('./AthenaClient');
    const token = await ath.getToken();
    console.log(JSON.stringify(token, null, 2));
  } catch (e) {
    // Print axios response data if present for easier debugging
    console.error('ERROR', e.response && e.response.data ? JSON.stringify(e.response.data, null, 2) : e.message || e);
    process.exit(1);
  }
})();
