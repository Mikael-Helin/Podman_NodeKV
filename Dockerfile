FROM debian:bullseye

RUN mkdir app
WORKDIR /app

RUN apt-get update && apt-get install -y curl gnupg2 sqlite3
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
RUN node --version
RUN npm --version

COPY app.js .
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/bin/bash", "-c", "echo 'HELLO' && chmod +x /app/entrypoint.sh && /app/entrypoint.sh"]
CMD [ "node", "/app/app.js" ]
