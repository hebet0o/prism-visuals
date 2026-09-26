import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import pb from '../utils/pocketbase'

export default function GalleryPasswordForm({ galleryId }) {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(e) {
    e.preventDefault(); setMessage('')
    if (password.length < 12 || new TextEncoder().encode(password).length > 72 || password !== confirm) {
      setMessage(t('admin.galleries.passwordInvalid')); return
    }
    setBusy(true)
    try {
      await pb.send(`/api/prism/admin/${galleryId}/password`, { method: 'POST', body: { password } })
      setPassword(''); setConfirm(''); setMessage(t('admin.galleries.passwordSaved'))
    } catch { setMessage(t('admin.galleries.passwordFailed')) }
    finally { setBusy(false) }
  }
  return <details className="mt-4 border-t border-brand-charcoal pt-3 text-brand-warm">
    <summary className="cursor-pointer">{t('admin.galleries.setPassword')}</summary>
    <form onSubmit={submit} className="mt-3 space-y-3 max-w-lg">
      <p className="text-sm text-brand-muted">{t('admin.galleries.passwordHelp')}</p>
      <label className="block">{t('admin.galleries.newPassword')}
        <input type="password" autoComplete="new-password" minLength={12} maxLength={72} required value={password} onChange={e => setPassword(e.target.value)} className="block w-full mt-1 p-2 bg-brand-black border border-brand-charcoal rounded" />
      </label>
      <label className="block">{t('admin.galleries.confirmPassword')}
        <input type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} className="block w-full mt-1 p-2 bg-brand-black border border-brand-charcoal rounded" />
      </label>
      <button disabled={busy} className="btn-primary disabled:opacity-50">{t('admin.galleries.savePassword')}</button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </form>
  </details>
}
