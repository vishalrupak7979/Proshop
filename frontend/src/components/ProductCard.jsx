
// import React from 'react'
// import { Card } from 'react-bootstrap'
// import { Link } from 'react-router-dom'

// const ProductCard = ({ product }) => {
//   return (
//     <Card className="my-3 p-3 rounded">
//       <Link to={`/product/${product._id}`}>
//         <Card.Img 
//           src={`${import.meta.env.VITE_API_URL}${product.image}`} 
//           variant="top" 
//         />
//       </Link>

//       <Card.Body>
//         <Link to={`/product/${product._id}`}>
//           <Card.Title as="div"><strong>{product.name}</strong></Card.Title>
//         </Link>

//         <Card.Text as="h3">₹{product.price}</Card.Text>
//       </Card.Body>
//     </Card>
//   )
// }

// export default ProductCard


import React from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Rating from "./Rating";

const ProductCard = ({ product }) => {
  return (
    <Card className="my-3 p-3 rounded product-card " style={{marginTop:'10px'}}>
      <Link to={`/product/${product._id}`}>
        <div className="img-wrapper">
          <Card.Img
              src={`${import.meta.env.VITE_API_URL}${product.image}`} 
            variant="top"
            className="product-img"
          />
        </div>
      </Link>

      <Card.Body className="d-flex flex-column">
        <Link to={`/product/${product._id}`} className="text-decoration-none">
          <Card.Title as="h5" className="text-dark product-title">
            {product.name}
          </Card.Title>
        </Link>

        <Rating value={product.rating} />

        <h4 className="mt-2 mb-3">₹{product.price}</h4>

        <div className="mt-auto d-flex gap-2">
          

          <Button
            variant="success"
            className="w-100"
            as={Link}
            to={`/product/${product._id}`}
          >
            Buy Now
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
