
function getRepo() {
  # Set a regex. Note we can reuse this same one later for the second capture group
  local regex='([A-Za-z0-9\@\.]*):([A-Za-z0-9\@\.\/-]*)'
  # Get the current origin remote
  local gitUrl=$(git remote get-url --push origin)
  # Execute the regex
  [[ $gitUrl =~ $regex ]] 
  # Return the second match which is the first capture group, or the host portion
  echo ${BASH_REMATCH[1]}
}

