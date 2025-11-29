import { useEffect, useState } from "react";
import axios from "../api/axios";
import Loader from "../components/Loader";
import Message from "../components/Message";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data =  await axios.get("/orders/admin");
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


  console.log("ssssss",orders)
  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">All Orders</h2>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Total</th>
        
            <th>Delivered</th>
            <th>Address</th>
            <th>Items</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {orders?.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>

              <td>{order.user?.name}</td>

              <td>₹{order.totalPrice}</td>

              {/* <td>
                {order.isPaid ? (
                  <span className="text-success">Paid</span>
                ) : (
                  <span className="text-danger">Not Paid</span>
                )}
              </td> */}

              <td>
                {order.isDelivered ? (
                  <span className="text-success">Delivered</span>
                ) : (
                  <span className="text-warning">Pending</span>
                )}
              </td>

              <td>
                {order.shippingAddress?.address},{" "}
                {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.postalCode},{" "}
                {order.shippingAddress?.country}
              </td>

              <td>
                {order.orderItems.map((item) => (
                  <div key={item._id}>
                    {item.name} × {item.qty}
                  </div>
                ))}
              </td>

              <td>{new Date(order.createdAt).toLocaleDateString()}</td>

              <td>
                <a
                  className="btn btn-primary btn-sm"
                  href={`/admin/order/${order._id}`}
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderList;
