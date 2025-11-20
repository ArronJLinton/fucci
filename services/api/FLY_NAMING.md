# Fly.io Naming Rules

## App Name Requirements

Fly.io app names must:

- ✅ Use only **lowercase letters**, **numbers**, and **dashes** (`-`)
- ✅ Be under 63 characters
- ❌ **NO underscores** (`_`)
- ❌ **NO uppercase letters**
- ❌ **NO dots** (`.`)
- ❌ **NO special characters**

## Examples

### ✅ Valid Names

- `fucci-api-db`
- `fucci-api-redis`
- `fucci-api-production`
- `fucci-db-1`

### ❌ Invalid Names

- `fucci_db` (underscore)
- `Fucci-API-DB` (uppercase)
- `fucci.api.db` (dots)
- `fucci@api` (special characters)

## Quick Fix

If you tried to use `fucci_db`, change it to `fucci-api-db`:

```bash
# For PostgreSQL
fly mpg create --name fucci-api-db --region iad
# OR
flyctl postgres create --name fucci-api-db --region iad

# For Redis
flyctl redis create --name fucci-api-redis --region iad
```
