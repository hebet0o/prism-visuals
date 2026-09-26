#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
# Emergency immediate rollback only. Post-backup writes are preserved separately,
# but will not be present in the restored database. Never use as a routine downgrade.
base=/opt/pocketbase
[[ $EUID -eq 0 && $# -eq 1 ]] || { echo 'Usage as root: bash rollback.sh /opt/pocketbase/prism-backup-TIMESTAMP'; exit 1; }
backup=$(readlink -f -- "$1")
[[ $(readlink -f "$base") == "$base" && $(dirname "$backup") == "$base" && $(basename "$backup") == prism-backup-* ]] || exit 1
[[ -f "$backup/backup-complete" && -f "$backup/pb_data/data.db" && ! -e "$backup/data-after-install" ]] || { echo 'Incomplete backup or rollback already attempted.'; exit 1; }
[[ ! -L "$base/pb_data" ]] || exit 1
required=$(du -sk "$backup/pb_data" | awk '{print $1}')
available=$(df -Pk "$base" | awk 'END {print $4}')
(( available > required + 262144 )) || { echo 'Not enough space to restore without deleting current data.'; exit 1; }
systemctl stop pocketbase.service
mv -- "$base/pb_data" "$backup/data-after-install"
cp -a --reflink=auto "$backup/pb_data" "$base/pb_data"
for f in pb_hooks/prism-access.pb.js pb_hooks/prism-lib.js pb_migrations/1790441000_prism_access.js; do
  if [[ -f "$base/$f" ]]; then mv -- "$base/$f" "$backup/$(basename "$f").disabled"; fi
done
systemctl start pocketbase.service
echo 'Previous database restored. Disable the new frontend gallery route until the backend is repaired. Newer data remains in backup/data-after-install.'
