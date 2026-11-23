import "./theme-switch.css"

type ThemeToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
  size?: number
}

export default function ThemeToggle({
  checked,
  onChange,
  label = "Toggle theme",
  className = "",
  size,
}: ThemeToggleProps) {
  return (
    <label
      className={`theme-switch ${className}`}
      style={
        size === undefined
          ? undefined
          : ({ "--sky-toggle-size": `${size}px` } as React.CSSProperties)
      }
    >
      <input
        type="checkbox"
        className="theme-switch__checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={label}
      />
      <span className="theme-switch__container">
        <span className="theme-switch__clouds" aria-hidden="true" />
        <span
          className="theme-switch__stars-container"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="currentColor">
            <path d="M12 14c0 5-3 8-8 8 5 0 8 3 8 8 0-5 3-8 8-8-5 0-8-3-8-8Z" />
            <path d="M48 4c0 4-2.4 6.4-6.4 6.4 4 0 6.4 2.4 6.4 6.4 0-4 2.4-6.4 6.4-6.4C50.4 10.4 48 8 48 4Z" />
            <path d="M82 26c0 5-3 8-8 8 5 0 8 3 8 8 0-5 3-8 8-8-5 0-8-3-8-8Z" />
            <path d="M120 12c0 4-2.4 6.4-6.4 6.4 4 0 6.4 2.4 6.4 6.4 0-4 2.4-6.4 6.4-6.4C122.4 18.4 120 16 120 12Z" />
          </svg>
        </span>
        <span className="theme-switch__circle-container" aria-hidden="true">
          <span className="theme-switch__sun-moon-container">
            <span className="theme-switch__moon">
              <span className="theme-switch__spot" />
              <span className="theme-switch__spot" />
              <span className="theme-switch__spot" />
            </span>
          </span>
        </span>
      </span>
    </label>
  )
}
