import { useDispatch, useSelector } from 'react-redux'
import { FaMoon, FaSun } from 'react-icons/fa'
import { toggleTheme } from '../store/slices/themeSlice'

const ThemeToggle = () => {
  const dispatch = useDispatch()
  const isDark = useSelector((state) => state.theme.mode === 'dark')

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={() => dispatch(toggleTheme())}
    >
      {isDark ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
    </button>
  )
}

export default ThemeToggle
