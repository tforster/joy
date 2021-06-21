#!/bin/bash

####################################################################################################################################
# Bootstraps the National CLI, parses top level arguments and launches an apprprpriate handler
#
# @usage ./src/joy.sh
#
####################################################################################################################################

# Obtain the absolute path to the commands folder regardless of where this script is executed from
COMMANDS_DIR="$(dirname "$(readlink -f "$0")")"/commands

##
# help
# - Renders some simple  help text to stdout
#  
# @param {string} command: The optional command to display help for. If command is ommitted then generic help is rendered.
##
function help() {
  if [ -z $1 ]; then      
    find $COMMANDS_DIR -name '*.sh' | while IFS=$'\n' read -r FULL_PATH; do
      # Strip the COMMANDS_DIR portion by replacing it with an empty string to yeild a relative path
      FILE=${FULL_PATH/$COMMANDS_DIR/""}
      # Return the name portion minus the .sh
      FILE=${FILE%.*}
      # Extract command and optional subcommand 
      local COMMAND=$(cut -d "/" -f2 <<< $FILE)
      local SUBCOMMAND=$(cut -d "/" -f3 <<< $FILE)
      echo joy $COMMAND $SUBCOMMAND
    done  

  else 
    # TODO: Add additional check to see if requested command has help and if not, call self without args to show generic help
    echo "Command specific help is coming soon..."
  fi
}

##
# main
# - The main function that parses the args and attempts to construct and execute a command
#  
##
function main () {
  # Obtain the optional command and subcommand from any provided arguments
  COMMAND=$1
  SUBCOMMAND=$2

  # Check to see if $COMMAND matches a root command (although none exist yet but we are anticipating the use-case)
  if [ -f "$COMMANDS_DIR/$COMMAND.sh" ]; then
    # This is a request for a standalone command such as joy config
    FILE=$COMMAND.sh
  elif [ -f "$COMMANDS_DIR/$COMMAND/$SUBCOMMAND.sh" ]; then
    # This is a request for command with sub commands such as joy wpe deployStage
    FILE=$COMMAND/$SUBCOMMAND.sh
  else
    if [ -z $COMMAND ]; then
      # No external command was provided
      echo "Please use one of the following commands"
    elif [ $COMMAND != "help" ]; then
      # An invalid external command was provided
      printf "joy $COMMAND is not a valid command. Did you mean one of these commands:"
    fi
    
    # Call the help function
    help 

    # Exit the script immediately after executing the help function
    exit 1
  fi

  # Execute the command and pass in all args for now
  # TODO: Create an args array from which we can shift the ones already consumed as command and sub command before passing in.
  . $COMMANDS_DIR/$FILE "$@"
}

main "$@"
