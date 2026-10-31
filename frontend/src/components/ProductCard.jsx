import { Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Rating from "./Rating";
import { addToCart } from "../store/slices/cartSlice";
import { formatPrice } from "../utils/formatPrice";
import { imageUrl } from "../utils/imageUrl";
import { maxQty } from "../utils/quantity";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const inCart = useSelector((state) =>
    state.cart.cartItems.find((item) => item._id === product._id)
  );

  const outOfStock = product.countInStock === 0;
  const lowStock = !outOfStock && product.countInStock <= 3;

  const addToCartHandler = () => {
    const qty = Math.min((inCart?.qty || 0) + 1, maxQty(product.countInStock));
    dispatch(addToCart({ ...product, qty }));
    toast.success(`${product.name} added to cart`, { toastId: product._id });
  };

  return (
    <Card className="product-card">
      <Link to={`/product/${product._id}`} className="img-wrapper">
        <Card.Img
          src={imageUrl(product.image)}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />
        {outOfStock && <Badge bg="secondary" className="stock-badge">Out of stock</Badge>}
        {lowStock && <Badge bg="warning" text="dark" className="stock-badge">Only {product.countInStock} left</Badge>}
      </Link>

      <Card.Body className="d-flex flex-column">
        <div className="product-brand">{product.brand}</div>
        <Link to={`/product/${product._id}`} className="product-title">
          {product.name}
        </Link>

        <Rating value={product.rating} text={`(${product.numReviews})`} />

        <div className="product-price">{formatPrice(product.price)}</div>

        <Button
          variant="primary"
          className="mt-auto w-100"
          disabled={outOfStock}
          onClick={addToCartHandler}
        >
          {outOfStock ? "Unavailable" : "Add to cart"}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
