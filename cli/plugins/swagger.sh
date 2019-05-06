# Shift args so that $2 becomes $1, etc
shift

# Parse sub-command
case "$1" in
"build")
  echo Build and validate the Swagger definition
  $JOY/cli/joy.js $@
  ;;
"docs")
  echo View the local Swagger API with Swagger API Browser
  echo debug: Executing $JOY/cli/plugins/SwaggerCommands.js $@
  $JOY/cli/plugins/SwaggerCommands.js $@
  ;;
*)
  echo Additional Swagger help goes here
  ;;
esac
