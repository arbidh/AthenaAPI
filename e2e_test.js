// Simple end-to-end test runner that invokes a handler locally.
// It sets up an example event and calls the exported `handler` function of a module.
// Usage (zsh):
// ATHENA_CLIENT_ID=... ATHENA_CLIENT_SECRET=... ATHENA_ENV=preview node e2e_test.js

(async () => {
  try {
    // Choose which handler to test. Change as needed.
    const handlerModule = require('./FindPatient');

    // Example payload: search by firstName (adjust to your test data)
    const event = {
      body: JSON.stringify({ args: { firstName: 'John', lastName: '', phone: '', dateOfBirth: '' } })
    };

    console.log('Running FindPatient.handler with event:', event);

    const result = await handlerModule.handler(event);
    console.log('Handler result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('E2E test failed:', err.response && err.response.data ? err.response.data : err.message || err);
    process.exit(1);
  }
})();
