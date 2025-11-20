# Deployment Information

## Production Environment

- **API Base URL**: `https://api.careconnect.com` (Example)
- **Frontend URL**: `https://careconnect.com` (Example)

## Environment Differences

| Feature | Development | Production |
|---------|-------------|------------|
| **Database** | Local Docker PostgreSQL | Managed Cloud Database (e.g., AWS RDS) |
| **Logging** | Console (Verbose) | Structured Logging (JSON) |
| **CORS** | `*` or `localhost` | Restricted to frontend domain |
| **SSL** | HTTP | HTTPS (Required) |

## Health Checks

The API provides health check endpoints for monitoring:

- **GET /**: Returns "Hello World!" (Basic check)
- **GET /health**: (To be implemented) Detailed system health

## Deployment Pipeline

1. **Build**: `npm run build` (Compiles NestJS app to `dist/`)
2. **Test**: `npm run test` & `npm run test:e2e`
3. **Deploy**: Docker container or Node.js process manager (PM2)

## Docker Deployment

The application includes a `Dockerfile` (to be added) for containerized deployment.

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
```
