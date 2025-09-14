#!/bin/bash
echo "Building for production environment..."
npm run build:prod

echo "Deploying to production server..."
rsync -avz --delete dist/ user@prod-server:/var/www/workshop-frontend/

echo "Production deployment complete!"