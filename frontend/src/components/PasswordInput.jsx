import { useState } from 'react'
import { Form } from 'react-bootstrap'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const PasswordInput = (props) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-field">
      <Form.Control {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-toggle"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
      </button>
    </div>
  )
}

export default PasswordInput
