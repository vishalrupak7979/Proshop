import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "../api/axios";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { formatPrice } from "../utils/formatPrice";
import { usePageTitle } from "../utils/usePageTitle";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  usePageTitle("All orders");

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

  const markDelivered = async (id) => {
    setUpdatingId(id);
    try {
      const { data } = await axios.put(`/orders/${id}/deliver`);
      setOrders((current) =>
        current.map((order) =>
          order._id === id ? { ...order, isDelivered: data.isDelivered } : order
        )
      );
      toast.success("Order marked as delivered");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update the order");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  const revenue = orders
    .filter((order) => order.isPaid)
    .reduce((acc, order) => acc + order.totalPrice, 0);
  const toDeliver = orders.filter((order) => !order.isDelivered).length;

  return (
    <>
      <h1 className="page-title">All orders</h1>

      <div className="stat-grid">
        <div className="stat">
          <span>Revenue</span>
          <strong>{formatPrice(revenue)}</strong>
        </div>
        <div className="stat">
          <span>Orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="stat">
          <span>To deliver</span>
          <strong>{toDeliver}</strong>
        </div>
      </div>

      <Table responsive hover className="data-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td><Link to={`/order/${order._id}`}>#{order._id.slice(-8).toUpperCase()}</Link></td>
              <td>
                {order.user?.name || "Deleted user"}
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
                <div className="status-stack">
                  {order.isPaid ? <Badge bg="success">Paid</Badge> : <Badge bg="danger">Unpaid</Badge>}
                  {order.isDelivered ? (
                    <Badge bg="success">Delivered</Badge>
                  ) : (
                    <Badge bg="warning" text="dark">Pending</Badge>
                  )}
                </div>
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
              <td>
                {!order.isDelivered && (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={updatingId === order._id}
                    onClick={() => markDelivered(order._id)}
                  >
                    Mark delivered
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default AdminOrderList;
