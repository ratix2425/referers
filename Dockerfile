FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x scripts/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["scripts/entrypoint.sh"]
CMD ["npm", "run", "dev"]
