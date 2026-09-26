const descriptions = {
  '202.jpg': ['Jegygyűrűs kezek egymáson, világos menyasszonyi ruha és zöld öltöny mellett.', 'Wedding-ring hands resting together beside a white dress and green suit.'],
  '4L5A1864.jpg': ['Szemüveges nő portréja egy kültéri padon, sötét kabátban.', 'Portrait of a woman wearing glasses and a dark coat, seated on an outdoor bench.'],
  '4L5A2051.jpg': ['Napszemüveges férfi barna dzsekiben egy sötétzöld ajtó előtt.', 'A man wearing sunglasses and a brown jacket in front of a dark green door.'],
  'IMG_2224-2.jpg': ['Fekete-fehér esküvői portré: a pár összeérinti az orrát a fátyol alatt.', 'Black-and-white wedding portrait of a couple touching noses beneath a veil.'],
  'IMG_3661.jpg': ['Nő portréja világoskék ingben, napfényes kőárkád mellett.', 'Portrait of a woman in a pale blue shirt beside a sunlit stone arcade.'],
  'IMG_5894.jpg': ['Szemüveges nő nyitott könyvvel egy könyvespolc előtt.', 'A woman wearing glasses holding an open book in front of bookshelves.'],
}

export function imageAlt(image, language, index = 0) {
  if (typeof image === 'object') return image.alt || imageAlt(image.src, language, index)
  const known = descriptions[image?.split('/').pop()]
  return known ? known[language === 'hu' ? 0 : 1] : `${language === 'hu' ? 'Portfóliófotó' : 'Portfolio photograph'} ${index + 1}`
}

export function galleryPhotoAlt(picture, galleryName, index, language) {
  return picture.altText || picture.description || `${galleryName} — ${language === 'hu' ? 'fénykép' : 'photograph'} ${index + 1}`
}
