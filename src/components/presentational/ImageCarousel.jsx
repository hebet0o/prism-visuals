import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, A11y, Keyboard } from 'swiper/modules'
import { useTranslation } from 'react-i18next'
import { imageAlt } from '../../utils/imageAlt'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const ImageCarousel = ({ images, className = '', initialSlide = 0 }) => {
  const { i18n } = useTranslation()
  return (
    <Swiper
      modules={[Navigation, Pagination, A11y, Keyboard]}
      keyboard={{ enabled: true }}
      a11y={{ enabled: true, prevSlideMessage: i18n.language === 'hu' ? 'Előző kép' : 'Previous image', nextSlideMessage: i18n.language === 'hu' ? 'Következő kép' : 'Next image' }}
      spaceBetween={0}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      loop={true}
      initialSlide={initialSlide}
      className={className}
    >
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <div className="relative w-full h-full">
            <img
              src={typeof image === 'object' ? image.src : image}
              alt={imageAlt(image, i18n.language, index)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default ImageCarousel
