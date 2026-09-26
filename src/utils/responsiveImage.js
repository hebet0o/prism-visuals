import images from './homeImages.json'

export function responsiveImage(source) {
  const src = typeof source === 'object' ? source.src : source
  return images[src] || { src }
}
