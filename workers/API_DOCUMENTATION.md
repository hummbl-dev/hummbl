# HUMMBL API Documentation

Complete OpenAPI 3.0 specification for the HUMMBL backend API.

## Quick Links

- **Production API**: https://hummbl-backend.hummbl.workers.dev
- **Interactive Docs** (Swagger UI): https://hummbl-backend.hummbl.workers.dev/api/docs
- **OpenAPI Spec** (YAML): https://hummbl-backend.hummbl.workers.dev/api/docs/openapi.yaml
- **Local Dev Server**: http://localhost:8787

## Getting Started

### 1. View Interactive Documentation

Visit the Swagger UI for a fully interactive API browser:

```
https://hummbl-backend.hummbl.workers.dev/api/docs
```

You can:
- Browse all endpoints with detailed descriptions
- View request/response schemas
- Try API calls directly from the browser
- Authenticate and test protected endpoints
- Copy cURL commands for each endpoint

### 2. Authentication Flow

Most endpoints require authentication. Follow this flow:

```bash
# 1. Register a new user
curl -X POST https://hummbl-backend.hummbl.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'

# Response includes token
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "expiresAt": 1699700000000
}

# 2. Use token in subsequent requests
curl -X GET https://hummbl-backend.hummbl.workers.dev/api/workflows-protected \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Rate Limits

All endpoints are rate-limited to prevent abuse:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Auth endpoints (login, register) | 5 requests | per minute |
| Execution endpoints | 10 requests | per minute |
| General endpoints | 100 requests | per minute |

Rate limit headers are included in all responses:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining in current window
- `X-RateLimit-Reset` - Unix timestamp when limit resets

If you exceed limits, you'll receive a `429 Too Many Requests` response with a `Retry-After` header.

## API Endpoints

### Health & Status

- `GET /` - Health check with database status

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive token
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/me` - Get current user profile (requires auth)

### Workflows

All workflow endpoints require authentication (`Authorization: Bearer <token>`)

- `GET /api/workflows-protected` - List user's workflows
- `POST /api/workflows-protected` - Create new workflow
- `DELETE /api/workflows-protected/:id` - Delete workflow

### Admin

Admin endpoints require both authentication and `admin` role:

- `GET /api/workflows-protected/admin/workflows` - List all workflows (admin only)

## Request/Response Examples

### Create Workflow

```bash
curl -X POST https://hummbl-backend.hummbl.workers.dev/api/workflows-protected \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Research Pipeline",
    "description": "Automated research and analysis workflow",
    "tasks": [
      {
        "id": "task_1",
        "name": "Gather Research",
        "agentId": "agent_researcher",
        "status": "pending",
        "dependencies": []
      }
    ],
    "agents": ["agent_researcher"]
  }'
```

Response (201 Created):
```json
{
  "id": "wf_abc123",
  "name": "Research Pipeline",
  "description": "Automated research and analysis workflow",
  "userId": "user_123",
  "status": "draft",
  "tasks": [...],
  "agents": ["agent_researcher"],
  "createdAt": 1699700000000,
  "updatedAt": 1699700000000
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid auth token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## TypeScript Integration

Generate TypeScript types from the OpenAPI spec:

```bash
# Install openapi-typescript
npm install -D openapi-typescript

# Generate types
npx openapi-typescript https://hummbl-backend.hummbl.workers.dev/api/docs/openapi.yaml \
  -o src/types/api.ts

# Use in your code
import type { paths } from './types/api';

type LoginRequest = paths['/api/auth/login']['post']['requestBody']['content']['application/json'];
type LoginResponse = paths['/api/auth/login']['post']['responses']['200']['content']['application/json'];
```

## Testing with cURL

### Health Check
```bash
curl https://hummbl-backend.hummbl.workers.dev/
```

### Register User
```bash
curl -X POST https://hummbl-backend.hummbl.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

### Login
```bash
curl -X POST https://hummbl-backend.hummbl.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Get User Profile
```bash
# Replace TOKEN with actual token from login
curl https://hummbl-backend.hummbl.workers.dev/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Local Development

Run the API locally with Wrangler:

```bash
cd workers
npm run dev
```

Access local API at `http://localhost:8787`

View local docs at `http://localhost:8787/api/docs`

## Security

- All passwords are hashed using SHA-256 via Web Crypto API
- Session tokens are JWT format with expiration
- Rate limiting prevents abuse
- CORS configured for trusted origins only
- Input validation using Zod schemas

## Support

- Documentation: https://hummbl.vercel.app
- Issues: File on GitHub repository
- Email: support@hummbl.io (if configured)

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:
- YAML: `/api/docs/openapi.yaml`
- Interactive UI: `/api/docs`

You can import this spec into:
- Postman (Collection → Import → Link)
- Insomnia (Import → From URL)
- SwaggerHub (Create API → Import)
- VS Code extensions (REST Client, Thunder Client)

## Contributing

To update the API documentation:

1. Edit `workers/openapi.yaml` with your changes
2. Regenerate the embedded spec:
   ```bash
   cd workers
   cat openapi.yaml | sed 's/`/\\`/g' | \
     awk 'BEGIN {print "export const openapiSpec = \`"} {print} END {print "\`;"}'  \
     > src/lib/openapiSpec.ts
   ```
3. Deploy: `npm run deploy`

The Swagger UI will automatically reflect your changes.
