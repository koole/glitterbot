FROM node:slim
COPY . .
RUN npm install
CMD node glitterbot.js
