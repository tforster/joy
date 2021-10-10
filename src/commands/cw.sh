####################################################################################################################################
# cw.sh
# - Implements basic bookmark management to be used with the standalone "cw" function for changing working directories.
####################################################################################################################################

printf "${fYellow}${fBold}Change Working Directory (cw)${f0}\n"
printf "To change to a bookmarked working directory use 'cw {bookmark-name}'. The joy prefix is not required for changing, only for managing bookmarks.${f0}\n\n"

printf "${fYellow}${fBold}Bookmarks (in ~/.joy.json)${f0}\n"
jq -r '.bookmarks | to_entries[] | [ .key,  .value] | join(": ")' ~/.joy.json

printf "${fYellow}${fBold}\nCommands (coming soon)${f0}\n"
printf "joy cw add {bookmark} {path}: Add a new bookmark"
printf "joy cw remove {bookmark}:     Remove an existing bookmark"
