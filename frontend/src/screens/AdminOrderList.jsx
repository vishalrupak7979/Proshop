import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Table } from "react-bootstrap";
import axios from "../api/axios";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { formatPrice } from "../utils/formatPrice";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await axios.get("/orders/admin");
        setOrders(data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch order list"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <>
      <h1 className="page-title">All orders</h1>
      <p className="page-subtitle">{orders.length} orders</p>

      <Table responsive hover className="data-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Delivery</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>#{order._id.slice(-8).toUpperCase()}</td>
              <td>
                {order.user?.name}
                <div className="table-muted">
                  {order.shippingAddress?.city}, {order.shippingAddress?.country}
                </div>
              </td>
              <td>
                {order.orderItems.map((item) => (
                  <div key={item.name}>
                    {item.name} × {item.qty}
                  </div>
                ))}
              </td>
              <td>{formatPrice(order.totalPrice)}</td>
              <td>
                {order.isDelivered ? (
                  <Badge bg="success">Delivered</Badge>
                ) : (
                  <Badge bg="warning" text="dark">Pending</Badge>
                )}
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
              <td>
                <Link to={`/order/${order._id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default AdminOrderList;
