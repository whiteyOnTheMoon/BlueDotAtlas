#!/usr/bin/env bash
# BlueDotAtlas Roadmap 012 — READ-ONLY Linux VPS inventory.
#
# Run ON YOUR OWN VPS from the checked-out repository root:
#   bash scripts/audit-vps.sh > vps-audit-output.txt
# Optional existing rendering filesystem:
#   bash scripts/audit-vps.sh /path/to/existing/render-dir > vps-render-disk-output.txt
#
# No sudo, installs, service changes, external HTTP requests, disk stress tests,
# public IPs, hostnames, usernames, MACs, private ports or secret dumps.
# IMPORTANT: verify/redact output before sharing. Never commit raw diagnostics.
set -u
export LC_ALL=C
target="/"
if [[ $# -ge 1 ]]; then target="$1"; fi
if [[ ! -d "$target" ]]; then
  printf 'ERROR: target directory does not exist.\n' >&2; exit 2
fi
if [[ "$(uname -s)" != "Linux" ]]; then
  printf 'ERROR: this inventory is for Linux VPS only.\n' >&2; exit 2
fi
field() { printf '| %s | %s |\n' "$1" "$2"; }
show() { if [[ -n "$1" ]]; then printf '%s' "$1"; else printf 'NOT MEASURED'; fi; }
mem_mib() {
  awk -v name="$1" '$1==name":" {printf "%.0f MiB", $2/1024; found=1; exit}
    END {if(!found) printf "NOT MEASURED"}' /proc/meminfo
}
printf '# BlueDotAtlas VPS snapshot — Task 012\n\n'
printf 'Generated UTC: **%s**. Verify this ran on the target VPS.\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
printf 'Single read-only snapshot, **not a render or network benchmark**.\n\n'
printf '## OS and CPU\n\n| Metric | Observed |\n| --- | --- |\n'
os="$(awk -F= '$1=="PRETTY_NAME" {gsub(/^"|"$/,"",$2);print $2;exit}' /etc/os-release 2>/dev/null)"
field 'Operating system' "$(show "$os")"
field 'Kernel version' "$(uname -r)"
field 'CPU architecture' "$(uname -m)"
if command -v nproc >/dev/null 2>&1; then
  field 'Logical CPUs available' "$(nproc 2>/dev/null)"
  field 'Logical CPUs configured' "$(nproc --all 2>/dev/null)"
else field 'Logical CPUs' 'NOT MEASURED'; fi
if command -v lscpu >/dev/null 2>&1; then
  cores="$(lscpu -p=Socket,Core 2>/dev/null | awk '!/^#/ && NF && !seen[$0]++ {n++} END {if(n) print n}')"
  field 'Distinct guest-reported physical cores (not host guarantee)' "$(show "$cores")"
fi
if [[ -r /sys/fs/cgroup/cpu.max ]]; then
  quota="$(awk '{if($1=="max") print "not limited via cpu.max";else if($2>0) printf "%.2f CPU-equivalent quota", $1/$2;else print "unknown"}' /sys/fs/cgroup/cpu.max)"
  field 'Cgroup v2 CPU quota' "$(show "$quota")"
else field 'Cgroup CPU limit' 'NOT EXPOSED (verify VPS plan)'; fi
field 'Load average 1/5/15 min (NOT CPU %)' "$(awk '{print $1" / "$2" / "$3}' /proc/loadavg)"

printf '\n## RAM and swap\n\n| Metric | Observed |\n| --- | --- |\n'
field 'RAM total' "$(mem_mib MemTotal)"
field 'RAM available at sample time' "$(mem_mib MemAvailable)"
field 'Swap total' "$(mem_mib SwapTotal)"
field 'Swap free' "$(mem_mib SwapFree)"
if [[ -r /sys/fs/cgroup/memory.max ]]; then
  cap="$(cat /sys/fs/cgroup/memory.max)"
  if [[ "$cap" == max ]]; then cap='not limited via memory.max'
  else cap="$(awk -v n="$cap" 'BEGIN {printf "%.0f MiB",n/1048576}')"; fi
  field 'Cgroup v2 memory limit' "$cap"
else field 'Cgroup RAM limit' 'NOT EXPOSED (verify VPS plan)'; fi

printf '\n## Disk, SSD indicator and I/O\n\n| Metric | Observed |\n| --- | --- |\n'
disk="$(df -P -B1 -T "$target" 2>/dev/null | awk 'NR==2 {
 printf "filesystem=%s; total=%.2f GiB; used=%.2f GiB; available=%.2f GiB; utilization=%s",
 $2,$3/1073741824,$4/1073741824,$5/1073741824,$6}')"
field 'Filesystem containing selected directory (private path hidden)' "$(show "$disk")"
inodes="$(df -Pi "$target" 2>/dev/null | awk 'NR==2 {printf "inodes available=%s; used=%s", $4,$5}')"
field 'Filesystem inodes' "$(show "$inodes")"
if command -v lsblk >/dev/null 2>&1; then
  rotation="$(lsblk -d -n -o ROTA 2>/dev/null | awk '/^[[:space:]]*[01][[:space:]]*$/ {a[$1]=1}
    END{if(a[0]&&a[1])print "mixed";else if(a[0])print "nonrotational guest flag";else if(a[1])print "rotational guest flag";else print "unknown"}')"
  field 'Device rotation indicator (not an SSD guarantee)' "$(show "$rotation")"
else field 'SSD hardware type' 'UNKNOWN — verify provider'; fi
if [[ -r /proc/pressure/io ]]; then
  psi="$(awk '$1=="some" {printf "%s %s %s (I/O pressure, NOT throughput)",$2,$3,$4;exit}' /proc/pressure/io)"
  field 'Recent kernel I/O stall pressure' "$(show "$psi")"
else field 'Recent I/O pressure' 'UNAVAILABLE'; fi
field 'Disk throughput and latency / IOPS' 'NOT BENCHMARKED — separate approved test / Roadmap 013'

printf '\n## Docker / known services\n\n| Metric | Observed |\n| --- | --- |\n'
if command -v docker >/dev/null 2>&1; then
  field 'Docker CLI' "$(show "$(docker --version 2>/dev/null)")"
  ver="$(docker version --format '{{.Server.Version}}' 2>/dev/null)"
  field 'Docker Engine server version' "$(show "$ver")"
  if docker ps -q >/dev/null 2>&1; then
    running="$(docker ps -q 2>/dev/null | wc -l | awk '{print $1}')"
    field 'Running containers (COUNT only)' "$running"
  else field 'Running containers' 'NOT VISIBLE — daemon unavailable/access denied'; fi
else field 'Docker' 'CLI not found on PATH (verify host installation)'; fi
if command -v systemctl >/dev/null 2>&1; then
  for svc in docker nginx apache2 caddy traefik postgresql redis-server mariadb mysql; do
    if systemctl is-active --quiet "$svc" 2>/dev/null; then
      field "Service active: $svc" yes
    fi
  done
  field 'Service discovery limitation' 'Only checked standard whitelist; other workloads require operator inventory'
else field 'Service discovery' 'systemctl not available'; fi

printf '\n## Network / contractual transfer\n\n| Metric | Observed |\n| --- | --- |\n'
if [[ -r /proc/net/dev ]]; then
  traffic="$(awk 'NR>2 {
    gsub(/:/,"",$1);if($1!="lo"){n++; rx+=$2;tx+=$10}
  } END {printf "interfaces=%d; RX=%.1f MiB; TX=%.1f MiB since boot (NOT throughput)",n,rx/1048576,tx/1048576}' /proc/net/dev)"
  field 'Network interface counters (no IP/MAC)' "$traffic"
else field 'Network interfaces' 'NOT MEASURED'; fi
if command -v ss >/dev/null 2>&1; then
  listening="$(ss -lntH 2>/dev/null | wc -l | awk '{print $1}')"
  field 'TCP listening socket COUNT (no port details)' "$listening"
fi
field 'Provider monthly bandwidth / transfer allowance' 'UNKNOWN — needs VPS contract/provider portal'
field 'Contractual link speed / egress caps' 'UNKNOWN — needs VPS provider confirmation'
field 'External throughput, real RTT and packet loss' 'NOT MEASURED — no external network test performed'

printf '\n## Next steps required for Roadmap 012\n\n'
printf '%s\n' \
 '- Verify this was measured on the actual VPS, not a CI runner or local laptop.' \
 '- Confirm provider vCPU, dedicated/shared RAM, SSD type, network quota/limit and current hosted workloads.' \
 '- Collect an additional busy-hour baseline of CPU, RAM, disk and network; one idle sample is not a capacity guarantee.' \
 '- Fill the operator-reviewed CPU/RAM/storage/I/O/bandwidth budget for OS, Web, DB and renderer in docs/infra/vps-audit.md.' \
 '- No root access, package installs, load tests or external speedtests are performed by this script.' \
 '- Redact and review output before sending; NEVER commit credentials, private network identifiers or raw production logs.'
