import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

let openDialogs = 0
let previousOverflow = ''

export default function AccessibleDialog({ children, onClose, label, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    const opener = document.activeElement
    if (openDialogs++ === 0) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    dialog.showModal()
    return () => {
      dialog.close()
      if (--openDialogs === 0) document.body.style.overflow = previousOverflow
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [])
  return createPortal(<dialog ref={ref} aria-label={label}
    onCancel={e => { e.preventDefault(); onClose() }}
    className={`m-0 p-0 border-0 max-w-none max-h-none w-screen h-[100dvh] text-brand-warm ${className}`}>
    {children}
  </dialog>, document.body)
}
