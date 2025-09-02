import { FileX, Search, UserX, AlertCircle } from 'lucide-react'

function EmptyState({ 
  type = 'no-data', // 'no-data', 'no-results', 'error'
  title,
  message,
  actionText,
  onAction,
  icon: CustomIcon
}) {
  const configs = {
    'no-data': {
      icon: FileX,
      defaultTitle: 'Aucune évaluation',
      defaultMessage: 'Aucune évaluation n\'a été créée pour le moment. Commencez par créer votre première évaluation.',
      iconColor: 'text-gray-400'
    },
    'no-results': {
      icon: Search,
      defaultTitle: 'Aucun résultat',
      defaultMessage: 'Aucune évaluation ne correspond à vos critères de recherche. Essayez de modifier vos filtres.',
      iconColor: 'text-yellow-500'
    },
    'error': {
      icon: AlertCircle,
      defaultTitle: 'Erreur de chargement',
      defaultMessage: 'Une erreur s\'est produite lors du chargement des données. Veuillez réessayer.',
      iconColor: 'text-red-500'
    }
  }

  const config = configs[type]
  const Icon = CustomIcon || config.icon

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`h-32 w-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 opacity-50 animate-pulse`}></div>
        </div>
        <Icon className={`relative h-24 w-24 ${config.iconColor} animate-bounce-slow`} strokeWidth={1.5} />
      </div>
      
      <h3 className="mt-6 text-xl font-semibold text-gray-900">
        {title || config.defaultTitle}
      </h3>
      
      <p className="mt-2 text-sm text-gray-500 text-center max-w-md">
        {message || config.defaultMessage}
      </p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-hotel-gold hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotel-gold transition-all duration-200 hover:scale-105"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}

export default EmptyState