# Shift args so that $2 becomes $1, etc
shift

# Parse sub-command
case "$1" in
"signing-keys")
  openssl ecparam -genkey -name prime256v1 -noout -out secrets/ec_private.pem
  openssl ec -in secrets/ec_private.pem -pubout -out secrets/ec_public.pem
  ;;
*)
  echo Additional utils help goes here
  ;;
esac
