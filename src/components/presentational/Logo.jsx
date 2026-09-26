const Logo = ({ className = '', loading = 'eager' }) => (
  <img
    src="/optimized/prism-logo.svg"
    alt="PRISM Visuals logo"
    width="2800"
    height="1030"
    className={`block h-auto w-44 xl:w-52 ${className}`}
    loading={loading}
    decoding="async"
  />
)

export default Logo
