####################################################################################################################################
# aws.sh
# - A wrapper around the Docker implementation of the AWS CLI 
####################################################################################################################################

# Run the docker container interactively
# Destroy the container after the command completes
# Map the host ~/.aws/credentials and config files to the container root
# Map the current host directory to the container /aws directory
# Set the AWS profile to the host AWS_PROFILE environment variable
# Disable paging of output results 
# Pass all commands beyond `joy aws` to the container
docker run -it --rm  -v ~/.aws:/root/.aws -v $(pwd):/aws -e AWS_PROFILE -e AWS_PAGER="" amazon/aws-cli:latest "$@"