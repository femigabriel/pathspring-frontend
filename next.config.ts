/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  turbopack: {
    // Set the project root to your current directory
    root: path.join(__dirname),
  },
};

module.exports = nextConfig;