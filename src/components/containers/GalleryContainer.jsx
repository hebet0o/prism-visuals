import { useState } from 'react'
import GalleryGrid from '../presentational/GalleryGrid'
import ImageCarousel from '../presentational/ImageCarousel'

const GalleryContainer = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null)

  const handleImageClick = (index) => {
    setSelectedImage(index)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  return (
    <>
      <GalleryGrid images={images} onImageClick={handleImageClick} />

      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            onClick={closeModal}
          >
            &times;
          </button>
          <div className="w-full max-w-6xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <ImageCarousel images={images} autoplay={false} className="h-full" />
          </div>
        </div>
      )}
    </>
  )
}

export default GalleryContainer
