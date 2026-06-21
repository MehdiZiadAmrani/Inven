FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=3 CMD curl -fsS http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
