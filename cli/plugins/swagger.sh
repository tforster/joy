# Shift args so that $2 becomes $1, etc
shift

# Parse sub-command
case "$1" in
"build")
  echo Build and validate the Swagger definition
  $JOY/joy.js $@
  ;;
"view")
  echo View the local Swagger API with Swagger API Browser
  echo $JOY/joy.js
  $JOY/joy.js $@
  ;;
*)
  echo Additional Swagger help goes here
  ;;
esac
