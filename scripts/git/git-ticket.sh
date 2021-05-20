#!/bin/bash

###################################################################################################################################
# Creates a new branch named after the ticket specified by the ticket number argument
# - The new branch follows the Joy format ticket-type/00nn-slugified-ticket-title where:
#    - ticket-type is one of the allowed prefixes still being ratified but along the lines of bug, feature, hotfix
#    - 00nn is the left-zero-padded GitHub issue, ADO boards or GitLab ticket number
#    - slugified-ticket-title is the title lowercased with spaces and special characters replaced with a dash
#
# @usage ./git-ticket.sh {ticket-number}
# 
# @param {number} ticket-number $1: The Azure DevOps or GitHub ticket number to associate with the new branch
#
# Dependencies
# - bash: Required to use <<< redirection. E.g. this script won't work with sh.
# - git v2.30.0: Because this script is all about creating a Git branch
# - GitHub ClI v1.9.2: Required to work with GitHub issues. https://github.com/cli/cli
# - Azure DevOps CLI v2.22.1: Required to work with Azure DevOps Boards. https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
# - cut: Currently believed to be shell agnostic and available in most fullsize distros (e.g. probably not in Alpine)
# - jq v1.6: A shell tool for parsing JSON. https://stedolan.github.io/jq/
###################################################################################################################################

# Get the ticket number from the CLI as arg #1
TICKET_NUMBER=$1 
# TODO Exit with an error if no ticket number argument was provided

# Get the Git remote. Note this assumes origin exists and is the remote we want to work with in a multi-remote setting!
REMOTE=$(git remote get-url origin)
# TODO Exit with an error if no remote was found

# Split the remote into a provider and repository
PROVIDER=$(cut -d ":" -f1 <<< $REMOTE)
REPO=$(cut -d ":" -f2 <<< $REMOTE)

# Get the title and type based on the provider
case $PROVIDER in
  git@github.com)
    # Get the ticket info from the GitHub issue
    TICKET_INFO=$(gh issue view $TICKET_NUMBER --json title,labels)
    # Parse out the title and type from the ticket info 
    TITLE=$(echo $TICKET_INFO | jq -r '.title') 
    TYPE=$(echo $TICKET_INFO | jq -r '.labels[0].name' )
    ;;
  git@ssh.dev.azure.com)
    # Get the organization name as the second path segment of the repo in the form v3/{organization}/{project}/{repository}
    ORGANIZATION=$(cut -d "/" -f2 <<< $REPO)
    # Get the ticket info from the Azure DevOps Boards API pre-filtered down to the two fields we are interested in
    TICKET_INFO=$(az boards work-item show --id $TICKET_NUMBER --organization https://dev.azure.com/$ORGANIZATION/ --query '[fields."System.Title", fields."System.WorkItemType"]' -o json)

    # Parse out the title and type from the ticket info. Expected form is ["some title","some type"]
    TITLE=$(echo $TICKET_INFO | jq -r .[0])
    TYPE=$(echo $TICKET_INFO | jq -r .[1])
    ;;
  # TODO add support for GitLab here. Check out https://glab.readthedocs.io/en/latest/ to see if it will do what we need?
  *)
    echo Unrecognised provider
    exit 1
    ;;
esac

# Map provider type to our preferred prefix
case $TYPE in
  bug)
    # GitHub default bug
    # ADO default bug
    PREFIX=issue
    ;;
  enhancement)
    # GitHub default enhancement
    PREFIX=feature
    ;;    
  "Product Backlog Item")
    # ADO default PBI
    PREFIX=feature
    ;;        
  feature)
    # ADO default feature
    PREFIX=feature
    ;;            
  *)
    echo "Unrecognised type"
    exit 1
    ;;
esac

# Left pad the the ticket number with zeros
TICKET_NUMBER_PADDED=$(printf "%04d\n" $TICKET_NUMBER)
# Slugify the title 
SLUGIFIED=$(echo "$TITLE" | iconv -t ascii//TRANSLIT | sed -r s/[^a-zA-Z0-9]+/-/g | sed -r s/^-+\|-+$//g | tr A-Z a-z )
# Assemble the branch name
BRANCH_NAME=$PREFIX/$TICKET_NUMBER_PADDED-$SLUGIFIED

# Create and checkout the branch simultaneously
git checkout -b $BRANCH_NAME develop

# Echo out a bunch of debug crap for now
# echo "REMOTE                 $REMOTE"
# echo "PROVIDER               $PROVIDER"
# echo "ORGANIZATION           $ORGANIZATION"
# echo "REPO                   $REPO"
# echo "TITLE                  $TITLE"
# echo "TYPE                   $TYPE"
# echo "PREFIX                 $PREFIX"
# echo "TICKET_INFO            $TICKET_INFO"
# echo "TICKET_NUMBER_PADDED   $TICKET_NUMBER_PADDED"
# echo "SLUGIFIED              $SLUGIFIED"
# echo "BRANCH_NAME            $BRANCH_NAME"
