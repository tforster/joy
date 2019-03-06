# Shift args so that $2 becomes $1, etc
shift

# Parse sub-command
case "$1" in
"sandbox")
  echo SSHing to sandbox.rylli.com for user $2
  ssh $2@sandbox.rylli.com
  ;;
"api")
  echo SSHing into api.rylli.com for user $2
  ssh -i ~/.ssh/$2.pem $2@api.rylli.com
  ;;
"tunnel")
  echo Create a TCP tunnel via joy.sh tunnel {local and remote port} {remote-host}
  ssh -L $2:127.0.0.1:$2 -i ~/.ssh/tforster.pem $3 -N
  ;;
*) ;;
esac
