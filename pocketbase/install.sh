#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
base=/opt/pocketbase
release=$(cd -- "$(dirname -- "$0")" && pwd)
fail() { printf '%s\n' "$*" >&2; exit 1; }
[[ $EUID -eq 0 ]] || fail 'Run as root.'
[[ $(readlink -f "$base") == "$base" ]] || fail 'Unexpected /opt/pocketbase path.'
[[ $(systemctl show pocketbase.service -p WorkingDirectory --value) == "$base" ]] || fail 'Unexpected service working directory; inspect configuration first.'
service_user=$(systemctl show pocketbase.service -p User --value)
[[ -z $service_user || $service_user == root ]] || fail 'This installer expects the existing root-run service.'
command_line=$(systemctl show pocketbase.service -p ExecStart --value)
[[ $command_line == *'/opt/pocketbase/pocketbase serve '* ]] || fail 'Unexpected service command.'
[[ ! $command_line =~ --(dir|hooksDir|migrationsDir|encryptionEnv) ]] || fail 'Custom data/hooks/migrations/encryption flags need a tailored installation.'
"$base/pocketbase" --version | grep -Eq '(^| )0\.23\.4$' || fail 'This release is tested only with PocketBase 0.23.4.'
[[ -f "$base/pb_data/data.db" && ! -L "$base/pb_data" ]] || fail 'Expected local pb_data/data.db missing or symlinked.'
for folder in pb_hooks pb_migrations; do
  [[ ! -L "$base/$folder" ]] || fail "Symlinked $folder needs review."
done
for f in pb_hooks/prism-access.pb.js pb_hooks/prism-lib.js pb_migrations/1790441000_prism_access.js; do
  [[ -f "$release/$f" ]] || fail "Missing release file: $f"
  [[ ! -e "$base/$f" ]] || fail "Already installed or conflicting file: $base/$f"
done
(cd "$release" && sha256sum -c SHA256SUMS)
required=$(du -sk "$base/pb_data" | awk '{print $1}')
available=$(df -Pk "$base" | awk 'END {print $4}')
(( available > required + 262144 )) || fail 'Not enough disk space for a full backup plus 256 MB reserve.'
backup="$base/prism-backup-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -m 700 "$backup"
printf 'Stopping PocketBase for a consistent backup: %s\n' "$backup"
systemctl stop pocketbase.service
trap 'printf "Installation stopped. Backup: %s. PocketBase remains stopped; follow the rollback guide.\n" "$backup" >&2' ERR
cp -a --reflink=auto "$base/pb_data" "$backup/pb_data"
touch "$backup/backup-complete"
mkdir -p "$base/pb_hooks" "$base/pb_migrations"
install -m 600 "$release/pb_migrations/1790441000_prism_access.js" "$base/pb_migrations/1790441000_prism_access.js"
# Run only this release's migrations, leaving unrelated migration files untouched.
"$base/pocketbase" migrate up --dir="$base/pb_data" --migrationsDir="$release/pb_migrations"
install -m 600 "$release/pb_hooks/prism-lib.js" "$base/pb_hooks/prism-lib.js"
install -m 600 "$release/pb_hooks/prism-access.pb.js" "$base/pb_hooks/prism-access.pb.js"
systemctl start pocketbase.service
for attempt in {1..20}; do
  if curl -fsS http://127.0.0.1:8090/api/prism/health; then
    printf '\nInstalled. Backup: %s\nNext: deploy the frontend, set a NEW gallery password in Admin, and test a private gallery.\n' "$backup"
    exit 0
  fi
  sleep 1
done
systemctl stop pocketbase.service
fail "Health check failed. Service stopped. Follow rollback guide using $backup."
