# AthenaAPI (local SDK wrapper)

This workspace contains lightweight lambda-style handlers that call the Athena Health API. I removed AWS SecretsManager dependencies and added a small `AthenaClient.js` helper to centralize OAuth and base URL configuration.

Quick start (zsh)

1. Install dependencies (if you haven't already):

```bash
cd /private/tmp/aws-toolkit-vscode/lambda/us-west-1/AthenaAPI
npm install
```

2. Set your Athena preview credentials as environment variables (do NOT commit these):

```bash
export ATHENA_CLIENT_ID='your_client_id'
export ATHENA_CLIENT_SECRET='your_client_secret'
export ATHENA_ENV='preview' # or 'production'
```

3. Fetch a token (quick check):

```bash
node testToken.js
```

4. Run an end-to-end handler test locally (invokes `FindPatient.handler`):

```bash
node e2e_test.js
```

Notes
- `AthenaClient.js` exposes `getToken()`, `getBaseUrl()` and `getPracticeId(fallback)`.
- Handlers now call `AthenaClient.getToken()` internally and use `getBaseUrl()` to build Athena API URLs.
- Default practice IDs are left in handlers but you can override with `ATHENA_PRACTICE_ID` environment variable if you want a global value.

Security
- Keep client credentials out of source control. Use environment variables or a secure secrets store in production.

If you'd like, I can:
- Replace hard-coded practice IDs with `ATHENA_PRACTICE_ID` across all handlers.
- Add more e2e scripts that exercise booking/cancel flows (non-destructive tests where possible).
