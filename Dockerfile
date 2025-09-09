FROM node:18-slim


RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    lsb-release \
    build-essential \
    gfortran \
    libatlas-base-dev \
    liblapack-dev \
    libfreetype6-dev \
    libpng-dev \
    libblas-dev \
    pkg-config \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app


COPY package.json package-lock.json ./
RUN npm install --production


COPY requirements.txt .
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt


RUN python -m nltk.downloader punkt


COPY . .

EXPOSE 3000

CMD ["node", "app.js"]