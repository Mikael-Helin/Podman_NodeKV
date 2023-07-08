FROM node:bullseye

RUN mkdir -p /opt/app/dist
WORKDIR /opt/app

RUN apt-get update
RUN apt-get install -y sqlite3

RUN node --version
RUN npm --version

# Install sqlite3 driver for Node.js
RUN npm init -y
RUN npm install sqlite3

COPY app.js /opt/app/dist/app.js
COPY entrypoint.sh /opt/app/entrypoint.sh
RUN chmod +x /opt/app/entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/opt/app/entrypoint.sh"]
CMD [ "node", "/opt/app/dist/app.js" ]
