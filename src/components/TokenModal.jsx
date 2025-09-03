import { useState, useEffect } from 'react'
import { X, Key, Shield, Check } from 'lucide-react'
import LoadingButton from './LoadingButton'

function TokenModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  initialToken = ''
}) {
  const [isClosing, setIsClosing] = useState(false)
  const [token, setToken] = useState(initialToken)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setToken(initialToken)
      setError('')
      setIsConnecting(false) // Reset loading state when modal opens
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, initialToken])

  const handleClose = () => {
    if (isConnecting) return
    
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200)
  }

  const handleConnect = async () => {
    if (!token.trim()) {
      setError('Veuillez entrer un token valide')
      return
    }

    setIsConnecting(true)
    setError('')

    try {
      await onConfirm(token.trim())
      // Reset loading state after successful connection
      setIsConnecting(false)
    } catch (err) {
      setError('Erreur lors de la connexion. Veuillez vérifier votre token.')
      setIsConnecting(false)
    }
  }

  const handleSkip = () => {
    if (isConnecting) return
    onConfirm('')
  }

  if (!isOpen && !isClosing) return null

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-200 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden="true"
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className={`inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all duration-200 sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <Key className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Configuration du Token d'Accès
              </h3>
              
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Entrez votre token d'accès pour synchroniser les évaluations avec le système de stockage distant.
                </p>
                
                <div className="mt-4">
                  <label htmlFor="access-token" className="block text-sm font-medium text-gray-700 mb-1">
                    <Shield className="inline w-4 h-4 mr-1" />
                    Token d'accès sécurisé
                  </label>
                  <input
                    type="password"
                    id="access-token"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value)
                      setError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isConnecting) {
                        handleConnect()
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-gold ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Entrez votre token..."
                    disabled={isConnecting}
                    autoFocus
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                </div>

                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> Ce token sera enregistré localement pour vos prochaines connexions depuis ce navigateur.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <LoadingButton
              type="button"
              onClick={handleConnect}
              icon={isConnecting ? undefined : Check}
              isLoading={isConnecting}
              variant="primary"
              disabled={!token.trim()}
              className="w-full sm:w-auto"
            >
              {isConnecting ? 'Connexion en cours...' : 'Se connecter'}
            </LoadingButton>
            
            <button
              type="button"
              className={`mt-3 sm:mt-0 inline-flex justify-center items-center w-full sm:w-auto px-4 py-2 bg-white text-base font-medium text-gray-700 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotel-gold sm:text-sm transition-all duration-200 ${
                isConnecting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleSkip}
              disabled={isConnecting}
            >
              Continuer sans token
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenModal