# Base image with Node.js
FROM node:18-slim

# Install Python and dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    lsb-release \
    build-essential \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy Node.js dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy project files
COPY . .

# Install Python dependencies from requirements.txt (preferred)
# Or directly install as you did
RUN pip3 install --no-cache-dir Flask gunicorn pandas numpy scikit-learn nltk textblob matplotlib

# Download NLTK data
RUN python3 -m nltk.downloader punkt

# Start Node app
CMD ["node", "app.js"]