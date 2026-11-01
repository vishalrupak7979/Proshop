import { imageUrl } from '../utils/imageUrl'

const ProductGallery = ({ images, selected, onSelect, name }) => (
  <div className="gallery">
    <div className="product-hero-img">
      <img src={imageUrl(selected)} alt={name} />
    </div>

    {images.length > 1 && (
      <div className="gallery-thumbs">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            className={image === selected ? 'gallery-thumb is-selected' : 'gallery-thumb'}
            aria-label={`Show photo ${index + 1} of ${images.length}`}
            aria-pressed={image === selected}
            onClick={() => onSelect(image)}
          >
            <img src={imageUrl(image)} alt="" />
          </button>
        ))}
      </div>
    )}
  </div>
)

export default ProductGallery
