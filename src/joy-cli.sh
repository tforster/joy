#!/bin/bash

####################################################################################################################################
# Bootstraps the Joy CLI, parses top level arguments and launches an appropriate handler
#
# @usage ./src/joy.sh
#
####################################################################################################################################

# Obtain the absolute path to the commands folder regardless of where this script is executed from including symlinks
cliDir="$(dirname "$(realpath "$0")")"

# Set the commandsDir for easier reference throughout
commandsDir=$cliDir/commands


# Include colours.sh
. $cliDir/includes/formatting.sh
# Include common functions
. $cliDir/includes/functions.sh

dotEnv .env


##
# main
# - The main function that parses the args and attempts to construct and execute a command
#
##
function main () {
  # Obtain the optional command and subcommand from any provided arguments
  COMMAND=$1; shift
  SUBCOMMAND=$1; shift

  # Check to see if $COMMAND matches a root command (although none exist yet but we are anticipating the use-case)
  if [ -f "$commandsDir/$COMMAND.sh" ]; then
    # This is a request for a standalone command such as joy config
    FILE=$COMMAND.sh
  elif [ -f "$commandsDir/$COMMAND/$SUBCOMMAND.sh" ]; then
    # This is a request for command with sub commands such as joy wpe deployStage
    FILE=$COMMAND/$SUBCOMMAND.sh
  else
    if [ -z $COMMAND ]; then
      # No external command was provided
      echo "Please use one of the following commands"
    elif [ $COMMAND != "help" ]; then
      # An invalid external command was provided
      printf "joy $COMMAND is not a valid command. Did you mean one of these commands:\n"
    fi

    # Call the help function
    . $commandsDir/help.sh

    # Exit the script immediately after executing the help function
    exit 1
  fi

  # Execute the command and pass in all args for now
  # TODO: Create an args array from which we can shift the ones already consumed as command and sub command before passing in.
  . $commandsDir/$FILE "$@"
}

main "$@"