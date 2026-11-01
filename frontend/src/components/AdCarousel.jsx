import { useEffect, useState } from 'react'
import { Carousel } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { imageUrl } from '../utils/imageUrl'

const AdContent = ({ ad }) => (
  <>
    <img src={imageUrl(ad.image)} alt="" />
    <div className="ad-text">
      <strong>{ad.title}</strong>
      {ad.text && <span>{ad.text}</span>}
    </div>
  </>
)

const AdCarousel = ({ fallback }) => {
  const [ads, setAds] = useState(null)

  useEffect(() => {
    api.get('/ads').then(({ data }) => setAds(data)).catch(() => setAds([]))
  }, [])

  if (!ads) return fallback
  if (ads.length === 0) return fallback

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <Carousel
      className="ad-carousel"
      interval={reduceMotion ? null : 5000}
      controls={ads.length > 1}
      indicators={ads.length > 1}
      slide={!reduceMotion}
    >
      {ads.map((ad) => (
        <Carousel.Item key={ad._id}>
          {!ad.link ? (
            <div className="ad-slide"><AdContent ad={ad} /></div>
          ) : ad.link.startsWith('/') ? (
            <Link to={ad.link} className="ad-slide"><AdContent ad={ad} /></Link>
          ) : (
            <a href={ad.link} target="_blank" rel="noopener noreferrer sponsored" className="ad-slide"><AdContent ad={ad} /></a>
          )}
        </Carousel.Item>
      ))}
    </Carousel>
  )
}

export default AdCarousel
