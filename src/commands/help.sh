##
# help
# - Renders some simple  help text to stdout
#
# @param {string} command: The optional command to display help for. If command is ommitted then generic help is rendered.
##
function help() {
  if [ -z $1 ]; then
    find $commandsDir -name '*.sh' | while IFS=$'\n' read -r FULL_PATH; do
      # Strip the commandsDir portion by replacing it with an empty string to yeild a relative path
      FILE=${FULL_PATH/$commandsDir/""}
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

help