###################################################################################################################################
# Displays information about a Joy project that the command is run from
#
# @usage joy info
#
###################################################################################################################################

echo -e "\e[1mShell\e[0m"
echo "Shell: $(getShell)"

echo -e "\n\e[1mGit Information\e[0m"
echo "Repository host: $(getRepo)"

echo -e "\n\e[1mWebProducer\e[0m"
if isWebProducer; then
  echo "Enabled: True"
else
  echo "Enabled: False"
fi

echo -e "\n${FG_GREEN}${FS_UL}WPEngine${RESET_ALL}"
if isWPEngine; then 
  echo "Enabled: True"
else
  echo "Enabled: False"
fi
