import { useEffect, useState } from "react";
import { Badge, Button, Card, Form } from "react-bootstrap";
import { FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "../api/axios";
import Loader from "../components/Loader";
import Message from "../components/Message";
import StatusBadge from "../components/StatusBadge";
import { formatPrice } from "../utils/formatPrice";
import { paymentLabel } from "../utils/orderStatus";
import { usePageTitle } from "../utils/usePageTitle";

const NEXT_STEP = {
  Assigned: "Picked up",
  "Picked up": "Out for delivery",
  "Out for delivery": "Delivered",
};

const NEXT_LABEL = {
  Assigned: "Mark picked up",
  "Picked up": "Start delivery",
  "Out for delivery": "Mark delivered",
};

const SHARES_LOCATION = ["Picked up", "Out for delivery"];

const errorMessage = (err) => err.response?.data?.message || "Something went wrong, please try again";

const DeliveryCard = ({ order, onChange }) => {
  const [busy, setBusy] = useState(false);
  const [place, setPlace] = useState("");
  const [cashCollected, setCashCollected] = useState(false);
  const [failing, setFailing] = useState(false);
  const [reason, setReason] = useState("");

  const next = NEXT_STEP[order.status];
  const address = order.shippingAddress;
  const collectsCash = order.paymentMethod === "COD" && !order.isPaid;
  const needsCash = collectsCash && next === "Delivered";

  const send = async (url, body, message) => {
    setBusy(true);
    try {
      const { data } = await axios.put(url, body);
      onChange(data);
      toast.success(message);
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const advance = () =>
    send(`/orders/${order._id}/delivery-status`, { status: next, cashCollected }, `Marked ${next.toLowerCase()}`);

  const fail = async (e) => {
    e.preventDefault();
    await send(`/orders/${order._id}/delivery-status`, { status: "Failed", note: reason }, "Delivery marked as failed");
  };

  const sharePlace = async (e) => {
    e.preventDefault();
    if (await send(`/orders/${order._id}/location`, { label: place }, "Location updated")) {
      setPlace("");
    }
  };

  const shareGps = () => {
    if (!navigator.geolocation) {
      toast.error("This device can't share its location");
      return;
    }

    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        send(
          `/orders/${order._id}/location`,
          { lat: coords.latitude, lng: coords.longitude, label: place },
          "Location updated"
        ).then((saved) => saved && setPlace("")),
      () => {
        setBusy(false);
        toast.error("Allow location access for this site, or type where you are");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <Card className="delivery-card">
      <Card.Body>
        <div className="delivery-head">
          <strong>#{order._id.slice(-8).toUpperCase()}</strong>
          <StatusBadge status={order.status} />
        </div>

        <p className="delivery-customer">{order.user?.name}</p>
        <address>
          {address.address}, {address.city} {address.postalCode}
        </address>
        {address.phone && (
          <a href={`tel:${address.phone}`} className="delivery-phone">
            <FaPhoneAlt aria-hidden="true" /> {address.phone}
          </a>
        )}

        <ul className="delivery-items">
          {order.orderItems.map((item) => (
            <li key={item.product}>{item.name} × {item.qty}</li>
          ))}
        </ul>

        <div className="summary-row">
          <span>{paymentLabel(order)}</span>
          {collectsCash ? (
            <Badge bg="warning" text="dark">Collect {formatPrice(order.totalPrice)}</Badge>
          ) : (
            <strong>{formatPrice(order.totalPrice)}</strong>
          )}
        </div>

        {SHARES_LOCATION.includes(order.status) && (
          <Form onSubmit={sharePlace} className="delivery-location">
            <Form.Label htmlFor={`place-${order._id}`}>Where is this order now?</Form.Label>
            <Form.Control
              id={`place-${order._id}`}
              placeholder="e.g. Near MG Road Metro"
              maxLength={120}
              value={place}
              onChange={(e) => setPlace(e.target.value)}
            />
            <div className="delivery-actions">
              <Button type="button" variant="outline-primary" size="sm" disabled={busy} onClick={shareGps}>
                <FaMapMarkerAlt aria-hidden="true" /> Share GPS
              </Button>
              <Button type="submit" variant="outline-primary" size="sm" disabled={busy || !place.trim()}>
                Update place
              </Button>
            </div>
          </Form>
        )}

        {next && needsCash && (
          <Form.Check
            id={`cash-${order._id}`}
            className="delivery-cash"
            label={`I collected ${formatPrice(order.totalPrice)} in cash`}
            checked={cashCollected}
            onChange={(e) => setCashCollected(e.target.checked)}
          />
        )}

        {next && !failing && (
          <div className="delivery-actions">
            <Button disabled={busy || (needsCash && !cashCollected)} onClick={advance}>
              {NEXT_LABEL[order.status]}
            </Button>
            <Button variant="outline-danger" disabled={busy} onClick={() => setFailing(true)}>
              Can&apos;t deliver
            </Button>
          </div>
        )}

        {failing && (
          <Form onSubmit={fail} className="delivery-location">
            <Form.Label htmlFor={`reason-${order._id}`}>What went wrong?</Form.Label>
            <Form.Control
              id={`reason-${order._id}`}
              required
              maxLength={120}
              placeholder="e.g. Customer not reachable"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="delivery-actions">
              <Button type="submit" variant="danger" size="sm" disabled={busy}>Mark failed</Button>
              <Button type="button" variant="link" size="sm" onClick={() => setFailing(false)}>Back</Button>
            </div>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  usePageTitle("My deliveries");

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const { data } = await axios.get("/orders/deliveries");
        setOrders(data);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const updateOrder = (updated) =>
    setOrders((current) => current.map((order) => (order._id === updated._id ? updated : order)));

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  const open = orders.filter((order) => NEXT_STEP[order.status]);
  const done = orders.filter((order) => !NEXT_STEP[order.status]);
  const cash = done
    .filter((order) => order.codCollected)
    .reduce((acc, order) => acc + order.totalPrice, 0);

  return (
    <>
      <h1 className="page-title">My deliveries</h1>

      <div className="stat-grid">
        <div className="stat">
          <span>To deliver</span>
          <strong>{open.length}</strong>
        </div>
        <div className="stat">
          <span>Completed</span>
          <strong>{done.filter((order) => order.status === "Delivered").length}</strong>
        </div>
        <div className="stat">
          <span>Cash collected</span>
          <strong>{formatPrice(cash)}</strong>
        </div>
      </div>

      {open.length === 0 ? (
        <div className="empty-state">
          <h2>No deliveries right now</h2>
          <p>New orders will appear here when they&apos;re assigned to you.</p>
        </div>
      ) : (
        <div className="delivery-grid">
          {open.map((order) => (
            <DeliveryCard key={order._id} order={order} onChange={updateOrder} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <>
          <h2 className="section-title mt-4">Finished</h2>
          <div className="delivery-grid">
            {done.map((order) => (
              <DeliveryCard key={order._id} order={order} onChange={updateOrder} />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default DeliveryDashboard;
