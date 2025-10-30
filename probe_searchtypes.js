const axios = require('axios');
const athena = require('./AthenaClient');

(async () => {
  try {
    const token = await athena.getToken();
    const practiceid = athena.getPracticeId(195900);
    const base = athena.getBaseUrl();

    const url = `${base}/v1/${practiceid}/patients/search`;

    const candidates = [
      'name', 'firstname', 'first_name', 'first', 'givenname', 'given_name',
      'lastname', 'last_name', 'last', 'surname', 'name_firstlast', 'name_lastfirst',
      'phone', 'dob', 'dateofbirth', 'date_of_birth', 'birthdate', 'ssn'
    ];

    // First: try the /patients/search endpoint with multiple candidate searchtypes
    for (const c of candidates) {
      try {
        console.log('\nTrying /patients/search searchtype=', c);
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token.access_token}` },
          params: { searchtype: c, searchterm: 'John' },
          timeout: 20000,
        });
        console.log('-> status', res.status);
        console.log('-> data', JSON.stringify(res.data).slice(0, 1000));
      } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data;
        console.log('-> error status:', status);
        console.log('-> error body:', JSON.stringify(data));
      }
    }

    // Second: try the generic /patients endpoint with direct query params (firstname, lastname, phone, dob)
    const basePatientsUrl = `${base}/v1/${practiceid}/patients`;
    const directParams = [
      { firstname: 'John' },
      { lastname: 'Smith' },
      { phone: '5551234567' },
      { dob: '01/01/1990' },
    ];

    for (const params of directParams) {
      try {
        console.log('\nTrying /patients with params=', params);
        const res = await axios.get(basePatientsUrl, {
          headers: { Authorization: `Bearer ${token.access_token}` },
          params,
          timeout: 20000,
        });
        console.log('-> status', res.status);
        console.log('-> data', JSON.stringify(res.data).slice(0, 1000));
      } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data;
        console.log('-> error status:', status);
        console.log('-> error body:', JSON.stringify(data));
      }
    }
  } catch (err) {
    console.error('Probe failed:', err.response?.data || err.message || err);
  }
})();
