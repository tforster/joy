####################################################################################################################################
# az.sh
# - A wrapper around the Docker implementation of the Azure DevOps CLI 
####################################################################################################################################

# Run the docker container interactively
# Destroy the container after the command completes
# Map the host home folder to the container root (container can access ~/.ssh, etc)
# Map the current host directory to the container /az directory (currently unknown if this is actually used)
# Pass all commands beyond `joy az` to the container
docker run -it --rm -v ${HOME}:/root -v $(pwd):/az az:latest "$@"
