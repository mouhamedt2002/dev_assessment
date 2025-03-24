FROM node:22

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy backend
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
