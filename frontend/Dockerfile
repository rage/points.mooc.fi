FROM node:12

RUN apt-get update \
  && apt-get install -y build-essential libgl1-mesa-glx \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app && chown -R node /app

USER node

WORKDIR /app

COPY --chown=node package.json /app/
COPY --chown=node package-lock.json /app/

RUN npm ci

COPY --chown=node . /app

RUN rm schema.graphql \
  && npm run build

ENV NODE_ENV=production

EXPOSE 3021

CMD [ "npm", "run", "start" ]
