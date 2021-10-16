#!/bin/bash

###################################################################################################################################
# Synchronises the latest database, mu-plugins, plugins and uploads from prod to local.
#
# @usage ./scripts/syncDataAndPluginsFromProdToLocal.sh
#
###################################################################################################################################

# Set project specific environment variables
source ./scripts/exportEnv.sh

echo "Copying latest WPEngine automatic backup to ./data/export.sql"
scp $WPE_PROD@$WPE_PROD.ssh.wpengine.net:/sites/$WPE_PROD/wp-content/mysql.sql ./data/export.sql

echo "Replacing current local database in MySQL container..."
docker exec -i db.dev.$ORG mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < ./data/export.sql

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

echo "Synchronising latest mu-plugins..."
rsync -avz --delete $WPE_PROD@$WPE_PROD.ssh.wpengine.net:/home/wpe-user/sites/$WPE_PROD/wp-content/mu-plugins/ ./src/mu-plugins/

echo "Synchronising latest plugins..."
# See note in README.md how to exclude multiple custom plugins from being overwritten by syncs from prod
rsync -avz --delete --exclude $CUSTOM_PLUGIN $WPE_PROD@$WPE_PROD.ssh.wpengine.net:/home/wpe-user/sites/$WPE_PROD/wp-content/plugins/ ./src/plugins/

echo "Synchronising latest uploads..."
rsync -avz --delete $WPE_PROD@$WPE_PROD.ssh.wpengine.net:/home/wpe-user/sites/$WPE_PROD/wp-content/uploads/ ./src/uploads/

echo "Synchronisation of production database to Docker complete."
