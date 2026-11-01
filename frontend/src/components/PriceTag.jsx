import { Badge } from 'react-bootstrap'
import { formatPrice } from '../utils/formatPrice'

const PriceTag = ({ product, large = false }) => (
  <div className={large ? 'product-price product-price-lg' : 'product-price'}>
    {formatPrice(product.price)}
    {product.discountPercent && (
      <>
        <s className="price-original">{formatPrice(product.originalPrice)}</s>
        <Badge bg="danger" className="price-off">{product.discountPercent}% off</Badge>
      </>
    )}
  </div>
)

export default PriceTag
