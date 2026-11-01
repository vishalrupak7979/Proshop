import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "../api/axios";
import Loader from "../components/Loader";
import Message from "../components/Message";
import PasswordInput from "../components/PasswordInput";
import { formatPrice } from "../utils/formatPrice";
import { usePageTitle } from "../utils/usePageTitle";

const EMPTY_FORM = { name: "", email: "", phone: "", password: "" };

const AdminPartnerList = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  usePageTitle("Delivery partners");

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data } = await axios.get("/users/delivery-partners");
        setPartners(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load delivery partners");
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post("/users/delivery-partners", form);
      setPartners((current) => [...current, data]);
      setForm(EMPTY_FORM);
      toast.success(`${data.name} can now sign in`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add the partner");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <>
      <h1 className="page-title">Delivery partners</h1>

      <Row className="g-4">
        <Col lg={8}>
          {partners.length === 0 ? (
            <div className="empty-state">
              <h2>No delivery partners yet</h2>
              <p>Add your first partner so you can assign orders.</p>
            </div>
          ) : (
            <Table responsive hover className="data-table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Active</th>
                  <th>Delivered</th>
                  <th>Cash collected</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner._id}>
                    <td>
                      {partner.name}
                      <div className="table-muted">{partner.email} · {partner.phone}</div>
                    </td>
                    <td>{partner.active}</td>
                    <td>{partner.delivered}</td>
                    <td>{formatPrice(partner.cashCollected)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>

        <Col lg={4}>
          <Card className="summary-card">
            <Card.Body>
              <h2>Add a partner</h2>
              <Form onSubmit={submitHandler}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control required value={form.name} onChange={setField("name")} />
                </Form.Group>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" required autoComplete="off" value={form.email} onChange={setField("email")} />
                </Form.Group>
                <Form.Group controlId="phone" className="mb-3">
                  <Form.Label>Mobile number</Form.Label>
                  <Form.Control type="tel" required pattern="[6-9]\d{9}" title="10 digit mobile number" value={form.phone} onChange={setField("phone")} />
                </Form.Group>
                <Form.Group controlId="password" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <PasswordInput required minLength={6} autoComplete="new-password" value={form.password} onChange={setField("password")} />
                </Form.Group>
                <Button type="submit" className="w-100" disabled={saving}>
                  {saving ? "Adding..." : "Add partner"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminPartnerList;
