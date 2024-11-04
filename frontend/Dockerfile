FROM node:18

ENV NODE_OPTIONS="--max-old-space-size=8192"

WORKDIR /app

# Install vite and terser globally
RUN npm install -g vite terser && \
    chmod -R 777 /usr/local/lib/node_modules

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Set permissions
RUN chmod -R 777 .

# Run build
RUN npx vite build

# Serve using vite preview
EXPOSE 8080
CMD ["npx", "vite", "preview", "--host", "--port", "8080"]