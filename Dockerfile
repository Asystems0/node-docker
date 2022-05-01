FROM node:16.14.2
WORKDIR /app
COPY package.json .


ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install; \
        else npm install --only=production; \
        fi

COPY . ./
# ENV PORT 8080
EXPOSE $PORT
# EXPOSE 5000

CMD [ "node", "index.js"]