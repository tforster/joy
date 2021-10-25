FROM mcr.microsoft.com/azure-cli
# Add the Boards extension so we can read features and PBIs
RUN az extension add --name azure-devops 
# Set az as the default executable  
ENTRYPOINT [ "az" ]
# Set help as the default az command
CMD ["help"]