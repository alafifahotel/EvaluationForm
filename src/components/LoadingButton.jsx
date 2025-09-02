import { Loader2 } from 'lucide-react'

function LoadingButton({ 
  children, 
  isLoading = false,
  disabled = false,
  icon: Icon,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'success'
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  onClick,
  type = 'button',
  ...props 
}) {
  const baseStyles = 'inline-flex justify-center items-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantStyles = {
    primary: 'bg-hotel-gold text-white hover:bg-yellow-600 focus:ring-hotel-gold',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-hotel-gold'
  }
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  const disabledStyles = (isLoading || disabled) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      disabled={isLoading || disabled}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
          <span>Traitement...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="-ml-1 mr-2 h-4 w-4" />}
          {children}
        </>
      )}
    </button>
  )
}

export default LoadingButton