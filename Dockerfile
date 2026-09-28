# Stage 1: Build the React Application
FROM node:20-alpine AS builder
WORKDIR /app

# Install client dependencies
COPY client/package*.json ./client/
RUN cd client && npm install

# Build client
COPY client/ ./client/
RUN cd client && npm run build

# Stage 2: Serve React Production Build with Nginx on Alpine
FROM alpine:latest
RUN apk add --no-cache nginx

WORKDIR /news

# Copy the built React app into /news
COPY --from=builder /app/client/dist/ /news/

# Copy Nginx server configuration (SPA clean routing & /api/ proxy)
COPY nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
