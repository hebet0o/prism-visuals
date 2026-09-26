// PocketBase 0.23.4. Additive: no existing gallery/image/guest records are deleted.
migrate((app) => {
  const galleries = app.findCollectionByNameOrId('galleries')
  const pictures = app.findCollectionByNameOrId('pictures')
  const admin = '@request.auth.collectionName = "users" && @request.auth.id = "dzuvc18aamn9mno"'
  const lockedAuth = { type: 'auth', listRule: null, viewRule: null, createRule: null,
    updateRule: null, deleteRule: null, authRule: null, manageRule: null,
    passwordAuth: { enabled: false }, otp: { enabled: false }, oauth2: { enabled: false },
    authAlert: { enabled: false } }
  const keys = new Collection({ ...lockedAuth, name: 'prism_gallery_keys', fields: [
    { name: 'gallery', type: 'relation', collectionId: galleries.id, maxSelect: 1, required: true, cascadeDelete: true },
    { name: 'version', type: 'text', required: true, hidden: true },
  ], indexes: ['CREATE UNIQUE INDEX idx_prism_keys_gallery ON prism_gallery_keys (gallery)'] })
  app.save(keys)
  const sessions = new Collection({ ...lockedAuth, name: 'prism_gallery_sessions', authToken: { duration: 28800 }, fileToken: { duration: 120 }, fields: [
    { name: 'gallery', type: 'relation', collectionId: galleries.id, maxSelect: 1, required: true, cascadeDelete: true },
    { name: 'access', type: 'relation', collectionId: keys.id, maxSelect: 1, required: true, cascadeDelete: true },
    { name: 'version', type: 'text', required: true, hidden: true },
    { name: 'expires', type: 'date', required: true },
  ] })
  app.save(sessions)
  const guests = new Collection({ ...lockedAuth, name: 'prism_gallery_guests', authToken: { duration: 28800 }, fields: [
    { name: 'gallery', type: 'relation', collectionId: galleries.id, maxSelect: 1, required: true, cascadeDelete: true },
    { name: 'name', type: 'text', required: true, max: 80 },
    { name: 'nameKey', type: 'text', required: true, hidden: true, max: 80 },
    { name: 'likedPhotos', type: 'json', maxSize: 200000 },
  ], indexes: ['CREATE UNIQUE INDEX idx_prism_guest_name ON prism_gallery_guests (gallery, nameKey)'] })
  app.save(guests)
  app.save(new Collection({ name: 'prism_login_limits', type: 'base', fields: [
    { name: 'hits', type: 'number' }, { name: 'expires', type: 'date', required: true },
  ] }))
  const session = '@request.auth.collectionName = "prism_gallery_sessions" && @request.auth.expires > @now && @request.auth.version = @request.auth.access.version'
  galleries.listRule = galleries.viewRule = `isVisible = true || (${admin}) || (${session} && @request.auth.gallery = id)`
  galleries.createRule = galleries.updateRule = galleries.deleteRule = admin
  galleries.fields.getByName('passwordHash').hidden = true
  app.save(galleries)
  pictures.listRule = pictures.viewRule = `(isVisible = true && gallery.isVisible = true) || (${admin}) || (${session} && @request.auth.gallery = gallery)`
  pictures.createRule = pictures.updateRule = pictures.deleteRule = admin
  pictures.fields.getByName('image').protected = true
  app.save(pictures)
  const oldGuests = app.findCollectionByNameOrId('guest_users')
  oldGuests.listRule = oldGuests.viewRule = oldGuests.createRule = oldGuests.updateRule = oldGuests.deleteRule = null
  app.save(oldGuests)
  const users = app.findCollectionByNameOrId('users')
  users.createRule = null
  app.save(users)
}, (app) => {
  // Fail-closed rollback. Keep new credentials/profiles for recovery; don't delete data.
  const admin = '@request.auth.collectionName = "users" && @request.auth.id = "dzuvc18aamn9mno"'
  const g = app.findCollectionByNameOrId('galleries')
  g.listRule = g.viewRule = `isVisible = true || (${admin})`
  app.save(g)
  const p = app.findCollectionByNameOrId('pictures')
  p.listRule = p.viewRule = `(isVisible = true && gallery.isVisible = true) || (${admin})`
  app.save(p)
})
