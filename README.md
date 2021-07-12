docker build -t cedricmeyer/node-web-app .

docker run -p 49160:8080 -d --restart unless-stopped --name discord-bot cedricmeyer/node-web-app

docker-compose down && git pull && docker build -t cedricmeyer/node-web-app . && docker tag cedricmeyer/node-web-app:latest cedricmeyer/node-web-app:staging && docker-compose up -d --remove-orphans
