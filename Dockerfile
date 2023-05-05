FROM ghcr.io/puppeteer/puppeteer:19.11.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true  \ 
    PUPPETEER_EXECUTABLE_PATH=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe


    WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
CMD [ "node", "index.js" ]