# Shift args so that $2 becomes $1, etc
shift

# Parse sub-command
case "$1" in
"urls")
  $(ssh -L $2:localhost:$2 tforster@sandbox.rylli.com mysql -P $2 -h 127.0.0.1 -u $DB_USERNAME -p$DB_PASSWORD $DB_DATABASE <<<"UPDATE wp_options SET option_value='$3' WHERE option_name IN ('site_url', 'home');")
  echo Usage: joy.sh wordpress urls {remote-port-number} {new-host-name}
  ;;
"backup")
  $(ssh -L $2:localhost:$2 tforster@sandbox.rylli.com mysqldump -P $2 -h 127.0.0.1 -u $DB_USERNAME -p$DB_PASSWORD $DB_DATABASE >./db/export.sql)
  echo Usage: joy.sh wordpress backup {remote-port-number}
  ;;
"restore")
  echo not implemented yet
  echo Creates a restore of the wordpress database
  ;;
*)
  echo Additional Wordpress help goes here
  ;;
esac
