import { useState, useEffect } from 'react'
import pb from '../utils/pocketbase'

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

  // Load reviews from PocketBase on mount
  useEffect(() => {
    const loadReviews = async () => {
      try {
        // First, try to migrate any existing localStorage reviews to PocketBase
        await migrateLocalStorageReviews()

        // Load reviews from PocketBase
        let records = []
        try {
          records = await pb.collection('reviews').getFullList({
            sort: '-created',
            filter: 'isVisible != false'
          })
        } catch {
          // isVisible field may not exist in schema — fetch without filter
          records = await pb.collection('reviews').getFullList({
            sort: '-created'
          })
        }

        // Convert PocketBase records to the expected format
        const pbReviews = records.map(record => ({
          id: record.id,
          quote: record.quote,
          author: record.author,
          event: record.event,
          date: record.date,
        }))

        setReviews([...DEFAULT_REVIEWS, ...pbReviews])
      } catch (error) {
        console.error('Failed to load reviews:', error)
        // Fallback to localStorage if PocketBase is unavailable
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored)
            setReviews([...DEFAULT_REVIEWS, ...parsed])
          }
        } catch (fallbackError) {
          console.error('Fallback to localStorage also failed:', fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadReviews()
  }, [])

  // Migrate existing localStorage reviews to PocketBase
  const migrateLocalStorageReviews = async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)

        // Check if we've already migrated (avoid duplicate migrations)
        const existingCount = await pb.collection('reviews').getFullList({ limit: 1 })
        if (existingCount.length === 0 && parsed.length > 0) {
          // Migrate each review to PocketBase
          for (const review of parsed) {
            await pb.collection('reviews').create({
              quote: review.quote,
              author: review.author,
              event: review.event,
              date: review.date,
              isVisible: true
            })
          }

          // Clear localStorage after successful migration
          localStorage.removeItem(STORAGE_KEY)
          console.log('Successfully migrated reviews from localStorage to PocketBase')
        }
      }
    } catch (error) {
      console.error('Failed to migrate reviews:', error)
      // Don't throw - migration failure shouldn't break the app
    }
  }

  const addReview = async (review) => {
    try {
      const newReview = {
        quote: review.quote,
        author: review.author,
        event: review.event,
        date: new Date().toISOString().split('T')[0],
      }

      // Save to PocketBase
      const record = await pb.collection('reviews').create({
        ...newReview,
        isVisible: true
      })

      // Update local state
      const pbReview = {
        id: record.id,
        ...newReview
      }

      setReviews(prev => [...prev, pbReview])
      return pbReview
    } catch (error) {
      console.error('Failed to save review:', error)
      throw error
    }
  }

  // Admin functions
  const deleteReview = async (reviewId) => {
    try {
      await pb.collection('reviews').delete(reviewId)
      setReviews(prev => prev.filter(review => review.id !== reviewId))
    } catch (error) {
      console.error('Failed to delete review:', error)
      throw error
    }
  }

  const toggleReviewVisibility = async (reviewId, isVisible) => {
    try {
      await pb.collection('reviews').update(reviewId, { isVisible })

      // Update local state
      setReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, isVisible }
          : review
      ))
    } catch (error) {
      console.error('Failed to update review visibility:', error)
      throw error
    }
  }

  return {
    reviews,
    addReview,
    deleteReview,
    toggleReviewVisibility,
    isLoading
  }
}
