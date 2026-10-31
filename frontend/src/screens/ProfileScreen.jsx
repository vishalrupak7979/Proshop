import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Badge, Table } from "react-bootstrap";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { getMyOrders } from "../store/slices/orderSlice";
import { formatPrice } from "../utils/formatPrice";
import { usePageTitle } from "../utils/usePageTitle";

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);
  const { orders, loading, error } = useSelector((state) => state.orders);

  usePageTitle("My account");

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  return (
    <>
      <h1 className="page-title">{userInfo.name}</h1>
      <p className="page-subtitle">{userInfo.email}</p>

      <h2 className="section-title">My orders</h2>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>You haven&apos;t placed any orders yet.</p>
          <Link to="/" className="btn btn-primary">Start shopping</Link>
        </div>
      ) : (
        <Table responsive hover className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Total</th>
              <th>Delivery</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>#{order._id.slice(-8).toUpperCase()}</td>
                <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                <td>{formatPrice(order.totalPrice)}</td>
                <td>
                  {order.isDelivered ? <Badge bg="success">Delivered</Badge> : <Badge bg="warning" text="dark">On the way</Badge>}
                </td>
                <td><Link to={`/order/${order._id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default ProfileScreen;
