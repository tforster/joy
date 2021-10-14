# WARNING: This image will be built with your credentials embedded
# DO NOT USE this outside of a development workstation. 
# This is akin to persisting ADO console login credentials in the browser.
FROM mcr.microsoft.com/azure-cli

RUN \
  # Add the Boards extension so we can read features and PBIs
  az extension add --name azure-devops && \
  # Prompt the builder for their ADO credentials and compile into the image
  az login

# Set az as the default executable  
ENTRYPOINT [ "az" ]
# Set help as the default az command
CMD ["help"]