import { useState, useEffect } from 'react'
import pb from '../utils/pocketbase'

// Do not import visitor caches or seed testimonials. Publication is explicit.
export const useReviews = ({ admin = false } = {}) => {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    let active = true
    pb.collection('reviews').getList(1, 200, {
      sort: '-date', filter: admin ? '' : 'isVisible = true',
      fields: 'id,quote,author,event,date,isVisible',
    }).then(result => { if (active) setReviews(result.items) })
      .catch(() => { if (active) setReviews([]) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [admin])
  const addReview = async review => {
    const record = await pb.collection('reviews').create({
      quote: review.quote.trim(), author: review.author.trim(), event: review.event.trim(),
      date: new Date().toISOString().split('T')[0], isVisible: false,
      publicationConsent: review.publicationConsent,
    })
    // Pending reviews never enter the public carousel.
    if (admin) setReviews(prev => [record, ...prev])
    return record
  }
  const deleteReview = async id => {
    await pb.collection('reviews').delete(id)
    setReviews(prev => prev.filter(r => r.id !== id))
  }
  const toggleReviewVisibility = async (id, isVisible) => {
    await pb.collection('reviews').update(id, { isVisible })
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isVisible } : r))
  }
  return { reviews, isLoading, addReview, deleteReview, toggleReviewVisibility }
}
