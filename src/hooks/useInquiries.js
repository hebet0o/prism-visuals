import { useState, useEffect, useCallback } from 'react'
import pb from '../utils/pocketbase'

export const addInquiry = async (data) => {
  return await pb.collection('inquiries').create({
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone ? data.phone.trim() : '',
    service: data.service ? data.service.trim() : '',
    message: data.message.trim(),
    status: 'new'
  })
}

export const useInquiries = () => {
  const [inquiries, setInquiries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadInquiries = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await pb.collection('inquiries').getList(1, 200, {
        sort: '-created'
      })
      setInquiries(result.items)
    } catch (err) {
      console.warn('Failed to load inquiries from PocketBase:', err)
      setError(err)
      setInquiries([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInquiries()
  }, [loadInquiries])

  const updateInquiryStatus = async (id, status) => {
    try {
      await pb.collection('inquiries').update(id, { status })
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      )
    } catch (err) {
      console.error('Failed to update inquiry status:', err)
      throw err
    }
  }

  const deleteInquiry = async (id) => {
    try {
      await pb.collection('inquiries').delete(id)
      setInquiries((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error('Failed to delete inquiry:', err)
      throw err
    }
  }

  const newCount = inquiries.filter((i) => !i.status || i.status === 'new').length

  return {
    inquiries,
    isLoading,
    error,
    loadInquiries,
    updateInquiryStatus,
    deleteInquiry,
    newCount
  }
}
