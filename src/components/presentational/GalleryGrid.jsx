const GalleryGrid = ({ images, onImageClick, columns = 3 }) => {
  const gridColsClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={`grid ${gridColsClass} gap-1`}>
      {images.map((image, index) => (
        <div
          key={index}
          className="relative aspect-square overflow-hidden cursor-pointer group"
          onClick={() => onImageClick && onImageClick(index)}
        >
          <img
            src={image}
            alt={`Gallery image ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-[600ms] group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/30 transition-colors duration-[600ms]" />
        </div>
      ))}
    </div>
  )
}

export default GalleryGrid
