import { useState, useEffect } from 'react'

const STORAGE_KEY = 'prism-reviews'

const DEFAULT_REVIEWS = [
  {
    id: 1,
    quote: 'Gáborral már több alkalommal dolgoztunk együtt az évek során, és minden fotózás remek hangulatban zajlott. Tele van kreatív ötletekkel, türelmes és nagyon könnyű vele együtt dolgozni. A képek végeredménye pedig minden alkalommal kifogástalan volt.',
    author: 'Blanka',
    event: 'Baja',
    date: '2025-01-15',
  },
]

export const useReviews = () => {
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS)
  const [isLoading, setIsLoading] = useState(true)

  // Load reviews from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setReviews([...DEFAULT_REVIEWS, ...parsed])
      }
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addReview = (review) => {
    const newReview = {
      id: Date.now(),
      ...review,
      date: new Date().toISOString().split('T')[0],
    }

    const updated = [...reviews, newReview]
    setReviews(updated)

    // Save only user-submitted reviews to localStorage
    try {
      const userSubmitted = updated.slice(DEFAULT_REVIEWS.length)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userSubmitted))
    } catch (error) {
      console.error('Failed to save review:', error)
    }

    return newReview
  }

  return { reviews, addReview, isLoading }
}
