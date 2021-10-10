#!/bin/bash

###################################################################################################################################
# Installs the Joy CLI as a user (e.g. not for developing Joy CLI enhancements)
# - Intended to be called from npm install when the repo is first cloned and installed 
###################################################################################################################################

# Get the path to the root of this project
cliSrc=$(realpath ./src)
# Include shell functions so we can determine the correct rc file to write
source $cliSrc/includes/shell.sh

# Symlink from the repo to /usr/bin so that joy is available in the path
# TODO: /usr/bin is OS specific, make this portable
joy=/usr/bin/joy
if [ -L "$joy" ] ; then
  if [ -e "$joy" ] ; then
    echo "Found symlink joy and skipping reinstallation."
  else
    echo "Broken link"
  fi
elif [ -e "$joy" ] ; then
  echo "Not a link"
else
  sudo ln -s $cliSrc/joy-cli.sh /usr/bin/joy   
fi

# Create a function to change the working directory
if [[ $(type -t cw) != function ]]; then
  echo 'function cw() { cd $(jq -r --arg bookmark "$1" '"'"'.bookmarks[$bookmark]'"'"' ~/.joy.json) }' >> $(shellRc)
else
  echo "Found function cw() and skipping reinstallation."
fi 

# Create a new empty ~/.joy.json if one does not exist
if [ -f ~/.joy.json ]; then
  echo "Found ~/.joy.json and skipping recreation"
else
  echo '{"bookmarks":{"joy":"'$(realpath .)'"}}' >> ~/.joy.json
fi

echo "Please log out and back in again, or source your .bashrc/.zshrc"