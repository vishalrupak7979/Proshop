import { Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { clearCompare } from '../store/slices/compareSlice'

const CompareBar = () => {
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const count = useSelector((state) => state.compare.ids.length)

  if (count === 0 || pathname === '/compare') return null

  return (
    <div className="compare-bar" role="status">
      <span>{count} selected to compare</span>
      <Button variant="link" size="sm" onClick={() => dispatch(clearCompare())}>Clear</Button>
      <Link to="/compare" className="btn btn-primary btn-sm">Compare</Link>
    </div>
  )
}

export default CompareBar
