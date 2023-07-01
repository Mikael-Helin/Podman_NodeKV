FROM node:bullseye

RUN mkdir /app
WORKDIR /app

RUN apt-get update
RUN apt-get install -y sqlite3

RUN node --version
RUN npm --version

# Install sqlite3 driver for Node.js
RUN npm init -y
RUN npm install sqlite3

COPY app.js .
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/app/entrypoint.sh"]
CMD [ "node", "/app/app.js" ]
