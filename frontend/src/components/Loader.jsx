// Styled in index.html, so the same loader shows before the app has downloaded
const Loader = ({ inline = false, message }) => (
  <div className={inline ? 'app-loader is-inline' : 'app-loader'} role="status">
    <svg className="app-loader-mark" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="app-loader-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle className="app-loader-track" cx="50" cy="50" r="46" />
      <circle className="app-loader-ring" cx="50" cy="50" r="46" stroke="url(#app-loader-gradient)" />
      <g className="app-loader-bag">
        <path className="app-loader-handle" d="M40 43v-5a10 10 0 0 1 20 0v5" stroke="url(#app-loader-gradient)" />
        <path d="M34 42h32a3 3 0 0 1 3 2.7l2.5 25A4 4 0 0 1 67.5 74h-35a4 4 0 0 1-4-4.3l2.5-25A3 3 0 0 1 34 42Z" fill="url(#app-loader-gradient)" />
        <path fill="#fff" fillRule="evenodd" d="M44 49h8a6.5 6.5 0 0 1 0 13h-3v6h-5Zm5 4.5v4h2.5a2 2 0 0 0 0-4Z" />
      </g>
    </svg>
    <span className="app-loader-text">
      {message || 'Loading'}
      {!message && <span className="app-loader-dots"><i /><i /><i /></span>}
    </span>
  </div>
)

export default Loader
