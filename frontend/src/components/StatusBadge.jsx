import { Badge } from 'react-bootstrap'
import { statusBadge } from '../utils/orderStatus'

const StatusBadge = ({ status }) => <Badge {...statusBadge(status)}>{status}</Badge>

export default StatusBadge
