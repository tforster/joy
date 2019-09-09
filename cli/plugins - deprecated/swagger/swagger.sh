# Shift args so that $2 becomes $1, etc
shift

# Parse sub-command
case "$1" in
"build")
  echo Build and validate the Swagger definition
  echo XXX $JOY/plugins/SwaggerCommands.js
  $JOY/plugins/SwaggerCommands.js $@
  ;;
"serve")
  echo Serving Swagger definition
  # port 10010, no caching, fully open CORS, default file is swagger.json
  static-server -p 10010 -z -c "*" -i swagger.json api
  ;;
"docs")
  echo View the local Swagger API with Swagger API Browser
  echo debug: Executing $JOY/plugins/SwaggerCommands.js $@
  $JOY/plugins/SwaggerCommands.js $@
  ;;
*)
  HELP=HELP
  ;;
esac

if [ $HELP ]; then
  echo "Usage: joy docker [options]"
  echo 
  echo "Options:"
  echo "  build   Builds and validates definitions before copying to /api/swagger"
  echo "  serve   Starts an http server on 10010 and serves /api/swagger/swagger.json for docs"
  echo "  docs    Starts an http server on 1337 that serves Swagger UI"
fi
