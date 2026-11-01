import { Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaBalanceScale } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import PriceTag from "./PriceTag";
import Rating from "./Rating";
import { addToCart } from "../store/slices/cartSlice";
import { addToCompare, MAX_COMPARE, removeFromCompare } from "../store/slices/compareSlice";
import { imageUrl } from "../utils/imageUrl";
import { lineKey, withColor } from "../utils/cartLine";
import { maxQty } from "../utils/quantity";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const inCart = useSelector((state) =>
    state.cart.cartItems.find((item) => lineKey(item) === lineKey(withColor(product)))
  );

  const compareIds = useSelector((state) => state.compare.ids);
  const comparing = compareIds.includes(product._id);

  const outOfStock = product.countInStock === 0;
  const lowStock = !outOfStock && product.countInStock <= 3;

  const toggleCompare = () => {
    if (comparing) {
      dispatch(removeFromCompare(product._id));
    } else if (compareIds.length >= MAX_COMPARE) {
      toast.info(`You can compare up to ${MAX_COMPARE} products`, { toastId: "compare-limit" });
    } else {
      dispatch(addToCompare(product._id));
    }
  };

  const addToCartHandler = () => {
    const qty = Math.min((inCart?.qty || 0) + 1, maxQty(product.countInStock));
    dispatch(addToCart({ ...withColor(product), qty }));
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

        <PriceTag product={product} />

        <Button
          variant="primary"
          className="mt-auto w-100"
          disabled={outOfStock}
          onClick={addToCartHandler}
        >
          {outOfStock ? "Unavailable" : "Add to cart"}
        </Button>
      </Card.Body>

      <button
        type="button"
        className={comparing ? "compare-toggle is-active" : "compare-toggle"}
        aria-pressed={comparing}
        aria-label={`Compare ${product.name}`}
        title="Compare"
        onClick={toggleCompare}
      >
        <FaBalanceScale aria-hidden="true" />
      </button>
    </Card>
  );
};

export default ProductCard;
