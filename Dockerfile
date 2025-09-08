# Base image with Node.js
FROM node:18-slim

# Install Python and required system dependencies
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
    pkg-config \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy Node.js dependency files and install
COPY package.json package-lock.json ./
RUN npm install --production

# Copy Python requirements file and install
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Download NLTK data
RUN python3 -m nltk.downloader punkt

# Copy the rest of the project files
COPY . .

# Expose port (if Node.js listens on 3000, change if different)
EXPOSE 3000

# Start Node.js app (default)
CMD ["node", "app.js"]

# --- If you need Flask & Node.js together, replace CMD with ---
# CMD ["sh", "-c", "python3 api.py & node app.js"]