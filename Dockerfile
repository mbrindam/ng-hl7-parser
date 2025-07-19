# Stage 1: Build the Angular application
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN ./node_modules/.bin/ng build sample-app --configuration production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/sample-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
