import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const Rating = ({ value }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      stars.push(<FaStar key={i} className="text-warning" />);
    } else if (value >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-warning" />);
    }
  }

  return <div className="d-flex gap-1">{stars}</div>;
};

export default Rating;
