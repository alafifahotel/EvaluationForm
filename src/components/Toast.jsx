import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true)
    })

    // Set up exit animation
    const exitTimer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(onRemove, 300) // Wait for exit animation
    }, toast.duration - 300)

    return () => clearTimeout(exitTimer)
  }, [toast.duration, onRemove])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(onRemove, 300)
  }

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  }

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  }

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }

  const progressColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }

  return (
    <div
      className={`
        min-w-[320px] max-w-md rounded-lg shadow-lg border-2 p-4 
        transform transition-all duration-300 ease-out
        ${colors[toast.type]}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{
        backdropFilter: 'blur(10px)',
        background: toast.type === 'success' ? 'linear-gradient(135deg, rgba(249, 250, 251, 0.95), rgba(240, 253, 244, 0.95))' :
                   toast.type === 'error' ? 'linear-gradient(135deg, rgba(249, 250, 251, 0.95), rgba(254, 242, 242, 0.95))' :
                   toast.type === 'warning' ? 'linear-gradient(135deg, rgba(249, 250, 251, 0.95), rgba(254, 252, 232, 0.95))' :
                   'linear-gradient(135deg, rgba(249, 250, 251, 0.95), rgba(239, 246, 255, 0.95))'
      }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconColors[toast.type]}`}>
          {icons[toast.type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
        <div
          className={`h-full ${progressColors[toast.type]} animate-progress`}
          style={{
            animation: `progress ${toast.duration}ms linear`
          }}
        />
      </div>
    </div>
  )
}

export default Toast