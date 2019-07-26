# Shift args so that $2 becomes $1, etc
shift

# Parse sub-command
case "$1" in
"a11y")
  echo Tests the accessibility of http://$DEV:$WWW_PORT. Please ensure http://$DEV:$WWW_PORT is running \(e.g. npx joy docker start\).
  npx pa11y http://localhost:$WWW_PORT
  ;;
"scan-node")
  echo Scanning node project for security flaws
  docker run -it -p 9090:9090 opensecurity/nodejsscan:latest 
  ;;
*) 

echo joy Test
echo ========
echo Usage
echo joy test a11y: Run accessibility tests agains the current web project. Note that the project needs to be served via joy docker start first.
echo joy test scan: Scans the current node project source files for security issues.
  ;;
esac
