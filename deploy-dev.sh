#!/bin/bash
echo "Building for development environment..."
npm run build:dev

echo "Deploying to development server..."
rsync -avz --delete dist/ user@dev-server:/var/www/workshop-frontend/

echo "Development deployment complete!"