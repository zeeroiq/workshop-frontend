#!/bin/bash
echo "Building for integration environment..."
npm run build:int

echo "Deploying to integration server..."
rsync -avz --delete dist/ user@int-server:/var/www/workshop-frontend/

echo "Integration deployment complete!"