#!/bin/bash

###################################################################################################
# install.sh
#
# Attempts to clone the Joy repo to ~/.joy. 
#
# This script borrows heavily from Robby Russel's oh my zsh installer. For more details see 
# https://github.com/robbyrussell/oh-my-zsh/blob/master/tools/install.sh
#
###################################################################################################

main() {
  # Use colors, but only if connected to a terminal, and that terminal supports them.
  if which tput >/dev/null 2>&1; then
    ncolors=$(tput colors)
  fi
  if [ -t 1 ] && [ -n "$ncolors" ] && [ "$ncolors" -ge 8 ]; then
    RED="$(tput setaf 1)"
    GREEN="$(tput setaf 2)"
    YELLOW="$(tput setaf 3)"
    BLUE="$(tput setaf 4)"
    BOLD="$(tput bold)"
    NORMAL="$(tput sgr0)"
  else
    RED=""
    GREEN=""
    YELLOW=""
    BLUE=""
    BOLD=""
    NORMAL=""
  fi

  # Only enable exit-on-error after the non-critical colorization stuff, which may fail on systems 
  # lacking tput or terminfo
  set -e

  if [ ! -n "$JOY" ]; then
    JOY=~/joy
  fi

  if [ -d "$JOY" ]; then
    printf "${YELLOW}You already have Joy installed.${NORMAL}\n"
    printf "Please try 'joy.sh update' instead.\n"
    exit
  fi

  # Prevent the cloned repository from having insecure permissions. Failing to do so causes 
  # compinit() calls to fail with "command not found: compdef" errors for users with insecure 
  # umasks (e.g., "002", allowing group writability). Note that this will be ignored under Cygwin
  #  by default, as Windows ACLs take precedence over umasks except for filesystems mounted with 
  # option "noacl".
  umask g-w,o-w

  printf "${GREEN}Cloning Joy...${NORMAL}\n"
  command -v git >/dev/null 2>&1 || {
    echo "Error: git is not installed"
    exit 1
  }
  # The Windows (MSYS) Git is not compatible with normal use on cygwin
  if [ "$OSTYPE" = cygwin ]; then
    if git --version | grep msysgit > /dev/null; then
      echo "Error: Windows/MSYS Git is not supported on Cygwin"
      echo "Error: Make sure the Cygwin git package is installed and is first on the path"
      exit 1
    fi
  fi

  env git clone --depth=1 https://github.com/tforster/joy.git "$JOY" || {
    printf "Error: git clone of Joy repo failed\n"
    exit 1
  }

  # Switch to the newly cloned directory and update packages
  printf "${GREEN}Installing Node dependencies...${NORMAL}\n"
  cd $JOY
  npm i

  # Ensure the bootstrap script is executable
  printf "${GREEN}Creating executable...${NORMAL}\n"
  chmod +x $JOY/cli/joy.sh
  sudo ln -s $JOY/cli/joy.sh /usr/local/bin/joy
  
  printf "${GREEN}Try joy help or joy version to confirm installation${NORMAL}\n"
}

main
