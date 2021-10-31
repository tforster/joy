####################################################################################################################################
# ticket.sh
# - Create a Joy formatted branch from develop based on the provided ticket number
####################################################################################################################################

# Get the ticket number from the last CLI arg (accounts for Joy initiated as well as git initiated command)
ticketNumber=${@: -1}
# TODO Exit with an error if no ticket number argument was provided

# Get the Git remote. Note this assumes origin exists and is the remote we want to work with in a multi-remote setting!
remote=$(gitRemote)
# TODO Exit with an error if no remote was found

# Get the title and type based on the provider
case $(gitHostName) in
  github)
    # Get the ticket info from the GitHub issue
    ticketInfo=$($commandsDir/gh.sh issue view $ticketNumber --json title,labels)
    # Parse out the title and type from the ticket info 
    title=$(echo $ticketInfo | jq -r '.title') 
    type=$(echo $ticketInfo | jq -r '.labels[0].name' )
    ;;
  azure)
    # Get the organization name as the second path segment of the repo in the form v3/{organization}/{project}/{repository}
    repo=$(cut -d ":" -f2 <<< $remote)
    organisation=$(cut -d "/" -f2 <<< $repo)
    # Get the ticket info from the Azure DevOps Boards API pre-filtered down to the two fields we are interested in
    ticketInfo=$($commandsDir/az.sh boards work-item show --id $ticketNumber --organization https://dev.azure.com/$organisation/ --query '[fields."System.Title", fields."System.WorkItemType"]' -o json)
    # Parse out the title and type from the ticket info. Expected form is ["some title","some type"]
    title=$(echo $ticketInfo | jq -r .[0])
    type=$(echo $ticketInfo | jq -r .[1] | tr '[:upper:]' '[:lower:]')
    ;;
  # TODO add support for GitLab here. Check out https://glab.readthedocs.io/en/latest/ to see if it will do what we need?
  *)
    echo Unrecognised provider
    exit 1
    ;;
esac

# Map provider type to our preferred prefix
case $type in
  bug)
    # GitHub default bug
    # ADO default bug
    prefix=issue
    ;;
  enhancement)
    # GitHub default enhancement
    prefix=feature
    ;;    
  "product backlog item")
    # ADO default PBI
    prefix=feature
    ;;        
  feature)
    # ADO default feature
    prefix=feature
    ;;            
  *)
    echo "Unrecognised type"
    exit 1
    ;;
esac

# Left pad the the ticket number with zeros
ticketNumberPadded=$(printf "%04d\n" $ticketNumber)
# Slugify the title 
slugified=$(echo "$title" | iconv -t ascii//TRANSLIT | sed -r s/[^a-zA-Z0-9]+/-/g | sed -r s/^-+\|-+$//g | tr A-Z a-z )
# Assemble the branch name (skipping feature prefix for now)
# branchName=$prefix/$ticketNumberPadded-$slugified
branchName=$ticketNumberPadded-$slugified

# Create and checkout the branch simultaneously
git checkout -b $branchName develop

# Echo out a bunch of debug crap for now
# echo "REMOTE                 $REMOTE"
# echo "PROVIDER               $PROVIDER"
# echo "ORGANIZATION           $ORGANIZATION"
# echo "REPO                   $REPO"
# echo "TITLE                  $TITLE"
# echo "TYPE                   $TYPE"
# echo "PREFIX                 $PREFIX"
# echo "ticketInfo            $ticketInfo"
# echo "TICKET_NUMBER_PADDED   $TICKET_NUMBER_PADDED"
# echo "SLUGIFIED              $SLUGIFIED"
# echo "branchName            $branchName"
