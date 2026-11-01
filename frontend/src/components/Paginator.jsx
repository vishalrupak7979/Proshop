import { Pagination } from 'react-bootstrap'

// First, last and the pages around the current one, with gaps marked as null
const pageList = (page, pages) => {
  const wanted = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b)

  return wanted.flatMap((n, i) => {
    if (i === 0 || n === wanted[i - 1] + 1) return [n]
    return n === wanted[i - 1] + 2 ? [n - 1, n] : [null, n]
  })
}

const Paginator = ({ page, pages, onChange }) => {
  if (pages <= 1) return null

  return (
    <nav aria-label="Pages">
      <Pagination className="paginator">
        <Pagination.Prev disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page" />
        {pageList(page, pages).map((n, i) =>
          n === null ? (
            <Pagination.Ellipsis key={`gap-${i}`} disabled />
          ) : (
            <Pagination.Item
              key={n}
              active={n === page}
              aria-label={`Page ${n}`}
              onClick={() => n !== page && onChange(n)}
            >
              {n}
            </Pagination.Item>
          )
        )}
        <Pagination.Next disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Next page" />
      </Pagination>
    </nav>
  )
}

export default Paginator
