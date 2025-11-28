import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search, X } from 'lucide-react'

function CustomDropdown({
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionner...',
  disabled = false,
  searchable = false,
  icon: Icon,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Find the selected option
  const selectedOption = options.find(opt => opt.value === value)

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, searchable])

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex]
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }
  }

  const handleSelect = (option) => {
    onChange({ target: { name, value: option.value } })
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange({ target: { name, value: '' } })
    setSearchTerm('')
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
        break
      default:
        break
    }
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full px-4 py-3
          bg-white border-2 rounded-xl
          flex items-center justify-between gap-2
          transition-all duration-300 ease-out group
          ${disabled
            ? 'cursor-not-allowed opacity-50 bg-gray-50'
            : 'cursor-pointer border-gray-200 hover:border-hotel-gold/50 hover:shadow-md focus:outline-none'
          }
          ${isOpen ? 'border-hotel-gold shadow-lg shadow-hotel-gold/10' : ''}
        `}
        style={isOpen ? { boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.15), 0 10px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {Icon && <Icon className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${isOpen ? 'text-hotel-gold' : 'text-gray-400 group-hover:text-hotel-gold'}`} />}
          <span className={`flex-1 text-left truncate ${selectedOption ? 'text-gray-800' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClear(e) }}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Effacer la sélection"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </span>
          )}
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-hotel-gold' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute z-[9999] w-full mt-2
            bg-white border border-gray-100 rounded-2xl
            dropdown-menu-enter
            overflow-hidden
          "
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(212, 175, 55, 0.1)'
          }}
          role="listbox"
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setHighlightedIndex(0)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Rechercher..."
                  className="
                    w-full pl-10 pr-8 py-2.5
                    text-sm bg-gray-50 border-2 border-gray-100 rounded-xl
                    focus:outline-none focus:ring-0 focus:border-hotel-gold/50 focus:bg-white
                    transition-all duration-200
                    placeholder-gray-400
                  "
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('')
                      inputRef.current?.focus()
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <ul
            ref={listRef}
            className="max-h-64 overflow-y-auto py-2 dropdown-list-scroll"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500 text-center">
                Aucun résultat trouvé
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value
                const isHighlighted = index === highlightedIndex

                return (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      mx-2 px-3 py-2.5 flex items-center justify-between gap-2 cursor-pointer
                      rounded-xl transition-all duration-150 ease-out
                      dropdown-option
                      ${isSelected
                        ? 'bg-gradient-to-r from-hotel-gold/15 to-amber-500/10 text-hotel-gold font-medium'
                        : isHighlighted
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check className="h-5 w-5 text-hotel-gold flex-shrink-0 dropdown-check-enter" />
                    )}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default CustomDropdown
