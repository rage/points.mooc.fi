FROM google/cloud-sdk

RUN apt-get update && apt-get install -yy nodejs npm && rm -rf /var/lib/apt/lists/*
RUN npm i -g npx
