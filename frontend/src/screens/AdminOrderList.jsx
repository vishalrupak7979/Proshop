import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Form, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "../api/axios";
import Loader from "../components/Loader";
import Message from "../components/Message";
import StatusBadge from "../components/StatusBadge";
import { formatPrice } from "../utils/formatPrice";
import { paymentLabel } from "../utils/orderStatus";
import { usePageTitle } from "../utils/usePageTitle";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  usePageTitle("All orders");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [orderList, partnerList] = await Promise.all([
          axios.get("/orders/admin"),
          axios.get("/users/delivery-partners"),
        ]);
        setOrders(orderList.data);
        setPartners(partnerList.data);
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

  const updateOrder = async (id, action, body, message) => {
    setUpdatingId(id);
    try {
      const { data } = await axios.put(`/orders/${id}/${action}`, body);
      setOrders((current) =>
        current.map((order) =>
          order._id === id
            ? { ...data, user: order.user, deliveryPartner: data.deliveryPartner?.name ? data.deliveryPartner : order.deliveryPartner }
            : order
        )
      );
      toast.success(message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update the order");
    } finally {
      setUpdatingId(null);
    }
  };

  const cancelOrder = (order) => {
    if (window.confirm(`Cancel order #${order._id.slice(-8).toUpperCase()}? Its stock will be put back.`)) {
      updateOrder(order._id, "cancel", {}, "Order cancelled");
    }
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  const revenue = orders
    .filter((order) => order.isPaid)
    .reduce((acc, order) => acc + order.totalPrice - order.refundedAmount, 0);
  const toDeliver = orders.filter((order) => !order.isDelivered && order.status !== "Cancelled").length;

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
            <th>Partner</th>
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
                  <div key={`${item.name}-${item.color}`}>
                    {item.name}{item.color && ` (${item.color})`} × {item.qty}
                  </div>
                ))}
              </td>
              <td>
                {formatPrice(order.totalPrice)}
                {order.couponCode && <div className="table-muted">{order.couponCode}</div>}
              </td>
              <td>
                <div className="status-stack">
                  <Badge bg={order.isPaid ? "success" : "secondary"}>{paymentLabel(order)}</Badge>
                  <StatusBadge status={order.status} />
                </div>
              </td>
              <td>
                {["Placed", "Assigned", "Failed"].includes(order.status) ? (
                  <Form.Select
                    size="sm"
                    className="partner-select"
                    aria-label={`Delivery partner for order ${order._id.slice(-8).toUpperCase()}`}
                    disabled={updatingId === order._id}
                    value={order.deliveryPartner?._id || ""}
                    onChange={(e) =>
                      e.target.value && updateOrder(order._id, "assign", { partnerId: e.target.value }, "Delivery partner assigned")
                    }
                  >
                    <option value="">Choose partner</option>
                    {partners.map((partner) => (
                      <option key={partner._id} value={partner._id}>{partner.name}</option>
                    ))}
                  </Form.Select>
                ) : (
                  order.deliveryPartner?.name || "None"
                )}
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
              <td>
                <div className="status-stack">
                  {!order.isDelivered && order.status !== "Cancelled" && (
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={updatingId === order._id}
                      onClick={() => updateOrder(order._id, "deliver", {}, "Order marked as delivered")}
                    >
                      Mark delivered
                    </Button>
                  )}
                  {!order.isPaid && !order.isDelivered && order.status !== "Cancelled" && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      disabled={updatingId === order._id}
                      onClick={() => cancelOrder(order)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default AdminOrderList;
