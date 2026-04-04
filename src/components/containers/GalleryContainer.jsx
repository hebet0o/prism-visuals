import { useState } from 'react'
import GalleryGrid from '../presentational/GalleryGrid'
import ImageCarousel from '../presentational/ImageCarousel'

const GalleryContainer = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null)

  // Check if images is grouped (array of objects) or flat (array of strings)
  const isGrouped = images && images.length > 0 && typeof images[0] === 'object' && images[0].images

  const handleImageClick = (index) => {
    setSelectedImage(index)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  if (isGrouped) {
    // Grouped galleries
    return (
      <>
        {images.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl md:text-4xl text-brand-warm mb-4">
                {group.name}
              </h2>
              <span className="divider-line" />
            </div>
            <GalleryGrid images={group.images} onImageClick={(index) => handleImageClick({ groupIndex, imageIndex: index })} />
          </div>
        ))}

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
              <ImageCarousel images={images[selectedImage.groupIndex].images} autoplay={false} className="h-full" initialSlide={selectedImage.imageIndex} />
            </div>
          </div>
        )}
      </>
    )
  } else {
    // Flat gallery
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
}

export default GalleryContainer
