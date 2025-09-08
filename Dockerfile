# Use a base image that includes both Node.js and Python.
# This a good choice as it is officially maintained.
FROM node:18-slim

# Install Python and other necessary tools
# The `lsb-release` is often needed for some apt-get commands
# `python3-pip` is required to install python packages
# `build-essential` is needed to compile certain Python packages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    lsb-release \
    build-essential \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the Node.js package files
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm install --production

# Copy the entire project code into the container
COPY . .

# Install all Python dependencies at once using 'pip'
RUN pip install Flask gunicorn pandas numpy scikit-learn nltk textblob matplotlib

# Download NLTK data required for text analysis
RUN python3 -c "import nltk; nltk.download('punkt')"

# The command to start your Node.js application
CMD ["node", "app.js"]
