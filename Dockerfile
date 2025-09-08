FROM node:18-slim

# Install Python and system dependencies for scientific libs
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
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

# Install Node dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Download NLTK data
RUN python3 -m nltk.downloader punkt

# Copy project files
COPY . .

EXPOSE 3000

CMD ["node", "app.js"]