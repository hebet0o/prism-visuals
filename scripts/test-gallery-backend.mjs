// Integration test against the real, isolated PocketBase 0.23.4 executable.
// Usage: node scripts/test-gallery-backend.mjs /path/to/pocketbase
import { mkdtemp, cp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawn, execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import assert from 'node:assert/strict'
import net from 'node:net'

const binary = path.resolve(process.argv[2] || 'pocketbase')
assert.match(execFileSync(binary, ['--version'], { encoding: 'utf8' }), /0\.23\.4/)
const dir = await mkdtemp(path.join(tmpdir(), 'prism-access-test-'))
await cp('pocketbase/pb_hooks', path.join(dir, 'hooks'), { recursive: true })
await cp('pocketbase/pb_migrations', path.join(dir, 'migrations'), { recursive: true })
const uiMode = process.argv.includes('--ui')
const password = uiMode ? 'Local-demo-admin-2026!' : randomBytes(24).toString('hex')
await writeFile(path.join(dir, 'migrations/1700000000_fixture.js'), `migrate((app) => {
  const u = app.findCollectionByNameOrId('users'); u.passwordAuth.enabled = true; app.save(u)
  const admin = new Record(u); admin.set('id', 'dzuvc18aamn9mno'); admin.set('email', 'admin@example.test'); admin.setPassword('${password}'); app.save(admin)
  const other = new Record(u); other.set('email', 'other@example.test'); other.setPassword('${password}'); app.save(other)
  const root = new Record(app.findCollectionByNameOrId('_superusers')); root.set('email', 'root@example.test'); root.setPassword('${password}'); app.save(root)
  const g = new Collection({name:'galleries', type:'base', fields:[{name:'created',type:'autodate',onCreate:true},{name:'createdBy',type:'relation',collectionId:u.id,maxSelect:1},{name:'name',type:'text'},{name:'slug',type:'text'},{name:'passwordHash',type:'text'},{name:'isVisible',type:'bool'}]}); app.save(g)
  app.save(new Collection({name:'pictures',type:'base',fields:[{name:'gallery',type:'relation',collectionId:g.id,maxSelect:1},{name:'image',type:'file',maxSelect:1,thumbs:['200x200']},{name:'isVisible',type:'bool'},{name:'created',type:'autodate',onCreate:true}]}))
  app.save(new Collection({name:'guest_users',type:'base'}))
})`)
const port = await new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)) }) })
const base = `http://127.0.0.1:${port}`
let log = ''
const child = spawn(binary, ['serve', `--http=127.0.0.1:${port}`, `--dir=${path.join(dir,'data')}`, `--hooksDir=${path.join(dir,'hooks')}`, `--migrationsDir=${path.join(dir,'migrations')}`])
child.stdout.on('data', d => { log += d }); child.stderr.on('data', d => { log += d })
async function req(route, { token, body, method = body ? 'POST' : 'GET', headers = {}, status = 200 } = {}) {
  const res = await fetch(base + route, { method, headers: { ...(token ? { Authorization: token } : {}), ...(body && !(body instanceof FormData) ? {'Content-Type':'application/json'} : {}), ...headers }, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined })
  const data = await res.json().catch(() => null)
  assert.equal(res.status, status, `${method} ${route}: ${JSON.stringify(data)}`)
  return data
}
try {
  let ready = false
  for (let n = 0; n < 100; n++) {
    try { const r = await fetch(base + '/api/prism/health'); if (r.ok) { ready = true; break } } catch {}
    if (child.exitCode !== null) break
    await new Promise(r => setTimeout(r, 100))
  }
  assert.ok(ready, 'PocketBase failed to start: ' + log.slice(-1500))
  const auth = async (collection, identity) => (await req(`/api/collections/${collection}/auth-with-password`, { body: {identity,password} })).token
  const admin = await auth('users', 'admin@example.test')
  const other = await auth('users', 'other@example.test')
  const root = await auth('_superusers', 'root@example.test')
  const create = (c, body, token=admin) => req(`/api/collections/${c}/records`, {body,token})
  const g = await create('galleries', {name:'Private A',slug:'private-a'})
  const g2 = await create('galleries', {name:'Private B',slug:'private-b'})
  const publicG = await create('galleries', {name:'Public',isVisible:true})
  const upload = async (gallery, visible=false) => {
    const f = new FormData(); f.append('gallery', gallery); f.append('isVisible', String(visible))
    f.append('image', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')], {type:'image/png'}), 'test.png')
    return create('pictures',f)
  }
  const p = await upload(g.id), p2 = await upload(g2.id), pub = await upload(publicG.id,true)
  const setPassword = (id, token=admin, value='Gallery-secret-123') => req(`/api/prism/admin/${id}/password`,{token,body:{password:value}})
  await req(`/api/prism/admin/${g.id}/password`,{body:{password:'Gallery-secret-123'},status:401})
  await req(`/api/prism/admin/${g.id}/password`,{token:other,body:{password:'Gallery-secret-123'},status:403})
  await req(`/api/prism/admin/${g.id}/password`,{token:admin,body:{password:'short'},status:400})
  await setPassword(g.id); await setPassword(g2.id)
  const login = async (id, pw='Gallery-secret-123') => req('/api/prism/login',{body:{gallery:id,password:pw}})
  await req('/api/prism/login',{body:{gallery:g.id,password:'wrong'},status:401})
  const s = await login('private-a'), s2 = await login(g2.id)
  const preflight = await fetch(base+'/api/prism/guest/me',{method:'OPTIONS',headers:{Origin:'https://prismvisuals.hu','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'authorization,content-type,x-prism-guest'}})
  assert.ok(preflight.ok,'CORS preflight')
  assert.match(preflight.headers.get('access-control-allow-headers'),/x-prism-guest|\*/i)
  assert.equal((await req('/api/prism/session',{token:s.token})).gallery.id,g.id)
  assert.equal((await req('/api/collections/galleries/records')).items.length,1)
  const visible = (await req('/api/collections/galleries/records',{token:s.token})).items
  assert.ok(visible.some(x=>x.id===g.id)); assert.ok(!visible.some(x=>x.id===g2.id)); assert.ok(visible.every(x=>!('passwordHash' in x)))
  await req(`/api/collections/pictures/records/${p2.id}`,{token:s.token,status:404})
  await req(`/api/collections/pictures/records/${p.id}`,{token:s.token})
  for (const c of ['prism_gallery_keys','prism_gallery_sessions','prism_gallery_guests','prism_login_limits','guest_users']) {
    await req(`/api/collections/${c}/records`,{token:s.token,status:403})
  }
  for (const c of ['prism_gallery_keys','prism_gallery_sessions','prism_gallery_guests']) {
    await req(`/api/collections/${c}/auth-with-password`,{body:{identity:'x',password:'Gallery-secret-123'},status:403})
  }
  await req('/api/collections/prism_gallery_sessions/auth-refresh',{token:s.token,body:{},status:403})
  await req('/api/collections/prism_gallery_sessions/records',{token:admin,body:{gallery:g.id},status:403})
  const fileToken = async token => (await req('/api/files/token',{token,body:{}})).token
  const ft = await fileToken(s.token)
  const file = async (picture, token='', expected=200) => {
    const r = await fetch(`${base}/api/files/${picture.collectionId}/${picture.id}/${picture.image}?token=${token}`)
    assert.equal(r.status,expected,'protected file access'); if (r.ok) assert.match(r.headers.get('cache-control'),/no-store/)
  }
  await file(p,'',404); await file(p,ft); await file(p2,ft,404); await file(pub)
  const guest = await req('/api/prism/guest/register',{token:s.token,body:{name:'Test',pin:'1234'}})
  const gh = {'X-Prism-Guest':guest.token}
  await req('/api/prism/guest/login',{token:s.token,body:{name:'Test',pin:'9999'},status:401})
  await req('/api/prism/guest/login',{token:s.token,body:{name:'test',pin:'1234'}})
  assert.deepEqual((await req('/api/prism/guest/likes',{token:s.token,headers:gh,body:{likedPhotos:[p.id]}})).likedPhotos,[p.id])
  await req('/api/prism/guest/likes',{token:s.token,headers:gh,body:{likedPhotos:[p2.id]},status:403})
  await req('/api/prism/guest/me',{token:s2.token,headers:gh,body:{},status:403})
  await req('/api/prism/guest/me',{token:guest.token,headers:gh,body:{},status:401})
  await setPassword(g.id,admin,'New-gallery-secret-123')
  await req('/api/prism/session',{token:s.token,status:401})
  await file(p,ft,404)
  await req(`/api/collections/pictures/records/${p.id}`,{token:s.token,status:404})
  await req('/api/prism/login',{body:{gallery:g.id,password:'Gallery-secret-123'},status:401})
  const fresh = await login(g.id,'New-gallery-secret-123'), freshFt = await fileToken(fresh.token)
  await file(p,freshFt)
  await req('/api/prism/logout',{token:fresh.token,body:{}}); await file(p,freshFt,404)
  const expired = await login(g.id,'New-gallery-secret-123'), expiredFt = await fileToken(expired.token)
  await req(`/api/collections/prism_gallery_sessions/records/${expired.record.id}`,{method:'PATCH',token:root,body:{expires:'2020-01-01 00:00:00.000Z'}})
  await req('/api/prism/session',{token:expired.token,status:401}); await file(p,expiredFt,404)
  let limited = false
  for (let n=0;n<35;n++) {
    const r = await fetch(base+'/api/prism/login',{method:'POST',headers:{'Content-Type':'application/json','X-Forwarded-For':`192.0.2.${n}`},body:JSON.stringify({gallery:g2.id,password:'wrong'})})
    if (r.status===429) {limited=true;break} assert.equal(r.status,401)
  }
  assert.ok(limited,'Persistent login throttle did not engage')
  console.log('PASS: admin authorization, hashed credentials, scoped gallery/files, guests/likes, password rotation, logout, expiry and throttling (PocketBase 0.23.4).')
  if (uiMode) {
    console.log(`Local UI fixture only: ${base}; gallery /gallery/${g.id}; password New-gallery-secret-123`)
    await new Promise(() => {})
  }
} catch (e) { console.error(log.slice(-4000).replaceAll(password,'[redacted]')); throw e }
finally { child.kill(); console.log(`Isolated test data: ${dir}`) }
