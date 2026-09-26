import { useTranslation } from 'react-i18next'
import { imageAlt } from '../../utils/imageAlt'
import { responsiveImage } from '../../utils/responsiveImage'

const GalleryGrid = ({ images, onImageClick, columns = 3 }) => {
  const { i18n } = useTranslation()
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
          className={`relative aspect-square overflow-hidden group ${onImageClick ? 'cursor-pointer' : ''}`}
          role={onImageClick ? 'button' : undefined}
          tabIndex={onImageClick ? 0 : undefined}
          onKeyDown={e => { if (onImageClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onImageClick(index) } }}
          aria-label={onImageClick ? imageAlt(image, i18n.language, index) : undefined}
          onClick={() => onImageClick && onImageClick(index)}
        >
          <img
            {...responsiveImage(image)}
            sizes={columns === 2 ? '(min-width: 768px) 50vw, 100vw' : columns === 4 ? '(min-width: 1024px) 25vw, 50vw' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
            alt={imageAlt(image, i18n.language, index)}
            className="w-full h-full object-cover transition-transform duration-[600ms] group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/30 transition-colors duration-[600ms]" />
        </div>
      ))}
    </div>
  )
}

export default GalleryGrid
