#!/bin/bash

###################################################################################################################################
# Displays information about a Joy project that the command is run from
#
# @usage joy info
#
###################################################################################################################################

IS_JOY_PROJECT=0







function gitInfo() {

  echo $(git remote -v) | while read -r a; do 
    # Check for fatal then it's not even a repo

    # Iterate lines and group origins of push/pull into one
    
    echo $a;
    echo "X"
  done

}

function wpeInfo() {
 echo nothings

}

function environment() {
  cat .env
}

gitInfo
