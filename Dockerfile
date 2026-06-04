FROM node:24

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
