#!/bin/bash

###################################################################################################################################
# Sets the home and site URL to the port specified in .env
#
# @usage ./scripts/setHomeSiteUrl.sh
#
###################################################################################################################################

# Set project specific environment variables
source ./scripts/exportEnv.sh

echo "Updating home and siteurl..."
docker run -it \
  --volumes-from www.dev.$ORG \
  --network container:www.dev.$ORG \
  --user 33:33 \
  -e WORDPRESS_DB_NAME=$WORDPRESS_DB_NAME \
  -e WORDPRESS_DB_USER=$WORDPRESS_DB_USER \
  -e WORDPRESS_DB_PASSWORD=$WORDPRESS_DB_PASSWORD \
  -e WORDPRESS_DB_HOST=$WORDPRESS_DB_HOST \
  wordpress:cli \
  wp db query 'UPDATE wp_options SET option_value="http://localhost:'$WWW_PORT'" WHERE option_name in ("home", "siteurl")' --skip-column-names

echo "Home and site urls updated."
