####################################################################################################################################
# git.sh
# - Common functions for working with git repositories
####################################################################################################################################

# Get the git remote named origin
gitRemote() {
  echo $(git remote get-url --push origin 2>/dev/null)
}


# Get the host portion of the git remote
gitHost() {
  local remote=$(gitRemote)
  local regex="[[:alpha:]\.\@]*"

  [[ $remote =~ $regex ]] && echo "${BASH_REMATCH[0]}"
}


# Get the hosting provider of the git repository (e.g. Azure for Microsoft Azure DevOps or GitHub)
gitHostName() {
  local host=$(gitHost)
 
  # Set a regex. Note we can reuse this same one later for the second capture group
  local regex="azure|github"
  [[ $host =~ $regex ]] && echo "${BASH_REMATCH}"
}
  
