// Mirrors the server allowlist. This is UI gating; PocketBase rules enforce access.
// Update the server rules first when adding another administrator.
export function isAdminRecord(record) {
  return record?.collectionName === 'users' && record?.id === 'dzuvc18aamn9mno'
}
