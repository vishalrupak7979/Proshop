import Logo from './Logo'
import Message from './Message'

const AuthLayout = ({ title, subtitle, error, children }) => {
  return (
    <>
      <div className="auth-orbs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-card-inner">
            <Logo size={44} className="auth-logo" />
            <h1>{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
            {error && (
              <div key={error} className="auth-error">
                <Message variant="danger">{error}</Message>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthLayout
