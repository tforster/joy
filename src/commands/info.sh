####################################################################################################################################
# info.sh
# - Displays useful information about the current directory, expanding any known Joy meta information that may be present.
####################################################################################################################################

printf "${fYellow}${fBold}Shell${f0}\n"
printf "User Shell:      $(shellUser)\n"
printf "Executing Shell: $(shellExecuting)\n"
printf "Shell RC:        $(shellRc)\n\n"

printf "${fYellow}${fBold}Git${f0}\n"
printf "Remote:          $(gitRemote)\n"
printf "Host URL:        $(gitHost)\n"
printf "Host:            $(gitHostName)\n\n"

printf "${fYellow}${fBold}WebProducer${f0}\n"
if isWebProducer; then
  printf "Enabled:         True\n"
  printf ".env:\n"
  cat webproducer/.env | indent  
  printf "\n\n"
else
  printf "Enabled:         False\n\n"
fi

printf "${fYellow}${fBold}WPEngine${f0}\n"
if isWPEngine; then 
  printf "Enabled:         True\n"
  printf ".env:\n"
  cat .env | indent    
else
  printf "Enabled:         False\n\n"
fi
