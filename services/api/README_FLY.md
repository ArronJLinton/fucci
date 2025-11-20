# Quick Start: Deploy to Fly.io

## One-Time Setup

1. **Install Fly.io CLI:**

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly.io:**

   ```bash
   flyctl auth login
   ```

3. **Create PostgreSQL Database:**

   ```bash
   cd services/api
   # Recommended: Use Managed Postgres (supported by Fly.io)
   fly mpg create --name fucci-api-db --region iad

   # OR use unmanaged (not recommended for production)
   # flyctl postgres create --name fucci-api-db --region iad
   ```

   **Important:** App names must use only lowercase letters, numbers, and dashes (e.g., `fucci-api-db` ✅, NOT `fucci_db` ❌)

   Save the connection string shown in the output.

4. **Create Redis Instance:**

   ```bash
   flyctl redis create --name fucci-api-redis --region iad
   ```

   **Note:** Use dashes, not underscores (e.g., `fucci-api-redis` ✅)

   Save the connection string.

5. **Create the App:**

   ```bash
   cd services/api
   flyctl launch --no-deploy
   ```

   This creates the app on Fly.io. The `--no-deploy` flag prevents deployment until secrets are set.

6. **Set Secrets:**

   ```bash
   flyctl secrets set \
     DB_URL="<postgres-connection-string>" \
     REDIS_URL="<redis-connection-string>" \
     FOOTBALL_API_KEY="<your-key>" \
     RAPID_API_KEY="<your-key>" \
     OPENAI_API_KEY="<your-key>" \
     JWT_SECRET="<generate-random-string>" \
     --app fucci-api
   ```

7. **Attach Database & Redis:**

   ```bash
   # For Managed Postgres
   fly mpg attach fucci-api-db --app fucci-api

   # OR for unmanaged Postgres
   # flyctl postgres attach --app fucci-api fucci-api-db

   # Attach Redis
   flyctl redis attach --app fucci-api fucci-api-redis
   ```

8. **Deploy:**
   ```bash
   cd services/api
   flyctl deploy
   ```

## GitHub Actions Setup

1. Get your Fly.io API token:

   ```bash
   flyctl auth token
   ```

2. Add to GitHub Secrets:

   - Go to: Settings → Secrets and variables → Actions
   - Add secret: `FLY_API_TOKEN` = (output from step 1)

3. Push to main/master branch - deployment happens automatically!

## Environment Variables

All secrets can be set using:

```bash
flyctl secrets set KEY=value
```

View all secrets:

```bash
flyctl secrets list
```

See `DEPLOYMENT.md` for detailed documentation.
