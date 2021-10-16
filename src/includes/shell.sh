####################################################################################################################################
# shell.sh
# - Common functions for working with various shells including sh, bash, zsh, etc
####################################################################################################################################

# Get the users default shell
shellUser() { 
  if [ -n "`$SHELL -c 'echo $ZSH_VERSION'`" ]; then
    echo zsh
  elif [ -n "`$SHELL -c 'echo $BASH_VERSION'`" ]; then
    echo bash
  else
    ech unknown
  fi
}


# Get the path to the users shell rc file
shellRc() {
  local userShell=$(shellUser)
  if [[ $userShell == "zsh" ]]; then
    echo ~/.zshrc
  elif [[ $userShell == "zsh" ]]; then
    echo ~/.bashrc
  else 
    echo unknown
  fi 
}


# Get the shell that is executing this script
shellExecuting() {
  if test -n "$ZSH_VERSION"; then
    local profileShell=zsh
  elif test -n "$BASH_VERSION"; then
    local profileShell=bash
  elif test -n "$KSH_VERSION"; then
    local profileShell=ksh
  elif test -n "$FCEDIT"; then
    local profileShell=ksh
  elif test -n "$PS3"; then
    local profileShell=unknown
  else
    local profileShell=sh
  fi

  echo $profileShell
}