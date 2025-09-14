#!/bin/bash
echo "Building for certification environment..."
npm run build:cert

echo "Deploying to certification server..."
rsync -avz --delete dist/ user@cert-server:/var/www/workshop-frontend/

echo "Certification deployment complete!"