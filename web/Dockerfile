FROM node:11.3
ENV NODE_ENV development
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install
COPY . .
EXPOSE 3000
ENV PATH "/usr/src/app/node_modules/.bin:$PATH"
CMD npm start
