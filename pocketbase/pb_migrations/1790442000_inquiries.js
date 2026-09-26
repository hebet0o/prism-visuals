// PocketBase 0.23.4. Inquiries / Contact Messages collection
migrate((app) => {
  const admin = '@request.auth.collectionName = "users" && @request.auth.id = "dzuvc18aamn9mno"'
  const collection = new Collection({
    name: 'inquiries',
    type: 'base',
    fields: [
      { name: 'name', type: 'text', required: true, max: 120 },
      { name: 'email', type: 'email', required: true },
      { name: 'phone', type: 'text', max: 50 },
      { name: 'service', type: 'text', max: 100 },
      { name: 'message', type: 'text', required: true, max: 4000 },
      { name: 'status', type: 'select', values: ['new', 'replied', 'archived'], maxSelect: 1, required: true },
    ],
    indexes: [
      'CREATE INDEX idx_inquiries_created ON inquiries (created)',
      'CREATE INDEX idx_inquiries_status ON inquiries (status)',
    ],
    listRule: admin,
    viewRule: admin,
    createRule: '', // Public submission allowed so visitors can contact
    updateRule: admin,
    deleteRule: admin,
  })
  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('inquiries')
  if (collection) {
    app.delete(collection)
  }
})
