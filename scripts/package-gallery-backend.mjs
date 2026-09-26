import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'

const files = ['pb_hooks/prism-access.pb.js', 'pb_hooks/prism-lib.js', 'pb_migrations/1790441000_prism_access.js', 'install.sh', 'rollback.sh', 'README-HU.md']
const sums = await Promise.all(files.map(async f => `${createHash('sha256').update(await readFile('pocketbase/' + f)).digest('hex')}  ${f}`))
await writeFile('pocketbase/SHA256SUMS', sums.join('\n') + '\n')
await mkdir('artifacts', { recursive: true })
execFileSync('tar', ['-czf', 'artifacts/prism-gallery-backend.tar.gz', '-C', 'pocketbase', ...files, 'SHA256SUMS'])
console.log('Created artifacts/prism-gallery-backend.tar.gz (server code and instructions only).')
