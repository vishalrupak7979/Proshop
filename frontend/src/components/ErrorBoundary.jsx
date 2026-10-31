import { Component } from 'react'

// Shows a way out instead of a blank page if a screen crashes
class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="empty-state">
        <h1>Something went wrong</h1>
        <p>Reloading the page usually fixes this.</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    )
  }
}

export default ErrorBoundary
