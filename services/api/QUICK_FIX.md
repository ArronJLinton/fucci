# Quick Fix: App Crashing on Fly.io

## The Problem

The app is crashing because:

1. `REDIS_URL` is not set (defaulting to localhost which doesn't exist)
2. `JWT_SECRET` is not set
3. App can't connect to Redis and crashes

## Immediate Solution

Run these commands to set all required secrets:

```bash
# 1. Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
echo "Generated JWT_SECRET: $JWT_SECRET"

# 2. Get Redis URL (after attaching Redis)
# First attach Redis if not already attached:
flyctl redis attach --app fucci-api fucci-api-redis

# Then get the Redis URL:
flyctl redis status fucci-api-redis
# Look for "Private URL" or use: redis://internal.fucci-api-redis.internal:6379

# 3. Get Database URL (if DATABASE_URL was set by attachment)
# Check what was set:
flyctl secrets list --app fucci-api

# 4. Set ALL secrets at once:
flyctl secrets set \
  DB_URL="<your-postgres-url>" \
  REDIS_URL="redis://internal.fucci-api-redis.internal:6379" \
  JWT_SECRET="$JWT_SECRET" \
  FOOTBALL_API_KEY="<your-key>" \
  RAPID_API_KEY="<your-key>" \
  OPENAI_API_KEY="<your-key>" \
  --app fucci-api
```

## Verify Secrets Are Set

```bash
flyctl secrets list --app fucci-api
```

You should see:

- ✅ DB_URL
- ✅ REDIS_URL
- ✅ JWT_SECRET
- ✅ FOOTBALL_API_KEY
- ✅ RAPID_API_KEY
- ✅ OPENAI_API_KEY

## After Setting Secrets

The app should automatically restart and connect. Check logs:

```bash
flyctl logs --app fucci-api
```

You should see:

- ✅ "Server starting on 0.0.0.0:8080"
- ✅ No Redis connection errors
- ✅ No JWT_SECRET warnings
