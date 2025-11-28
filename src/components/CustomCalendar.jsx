import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parse
} from 'date-fns'
import { fr } from 'date-fns/locale/fr'

const CustomCalendar = ({
  value,
  onChange,
  name,
  placeholder = 'Sélectionner une date',
  className = '',
  minDate,
  maxDate,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date())
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState(null)
  const calendarRef = useRef(null)
  const inputRef = useRef(null)

  // Update selected date when value prop changes
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date)
      setCurrentMonth(date)
    } else {
      setSelectedDate(null)
    }
  }, [value])

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const handlePrevMonth = () => {
    setSlideDirection('right')
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentMonth(subMonths(currentMonth, 1))
      setIsAnimating(false)
    }, 150)
  }

  const handleNextMonth = () => {
    setSlideDirection('left')
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentMonth(addMonths(currentMonth, 1))
      setIsAnimating(false)
    }, 150)
  }

  const handleDateClick = (date) => {
    if (minDate && date < new Date(minDate)) return
    if (maxDate && date > new Date(maxDate)) return

    setSelectedDate(date)
    const formattedDate = format(date, 'yyyy-MM-dd')

    // Create a synthetic event to match the expected onChange signature
    onChange({
      target: {
        name: name,
        value: formattedDate
      }
    })

    setIsOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setSelectedDate(null)
    onChange({
      target: {
        name: name,
        value: ''
      }
    })
  }

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = []
    let day = startDate

    while (day <= endDate) {
      const currentDay = day
      const isCurrentMonth = isSameMonth(day, monthStart)
      const isSelected = selectedDate && isSameDay(day, selectedDate)
      const isTodayDate = isToday(day)
      const isDisabled =
        (minDate && day < new Date(minDate)) ||
        (maxDate && day > new Date(maxDate))

      days.push(
        <button
          key={day.toISOString()}
          type="button"
          onClick={() => !isDisabled && handleDateClick(currentDay)}
          disabled={isDisabled}
          className={`
            relative w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium
            calendar-day-hover
            ${!isCurrentMonth
              ? 'text-gray-300'
              : isDisabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-hotel-gold/10 hover:text-hotel-gold'
            }
            ${isSelected
              ? 'bg-gradient-to-br from-hotel-gold to-amber-500 text-white shadow-lg shadow-hotel-gold/30 calendar-day-selected hover:text-white hover:bg-gradient-to-br'
              : ''
            }
            ${isTodayDate && !isSelected
              ? 'ring-2 ring-hotel-gold/50 ring-offset-1'
              : ''
            }
            focus:outline-none focus:ring-2 focus:ring-hotel-gold focus:ring-offset-2
          `}
        >
          {format(day, 'd')}
          {isTodayDate && !isSelected && (
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-hotel-gold rounded-full" />
          )}
        </button>
      )
      day = addDays(day, 1)
    }

    return days
  }

  const displayValue = selectedDate
    ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })
    : ''

  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      {/* Input Field */}
      <div
        ref={inputRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          relative flex items-center w-full px-4 py-3 bg-white border-2 rounded-xl
          transition-all duration-300 ease-out cursor-pointer group
          ${isOpen
            ? 'border-hotel-gold calendar-input-glow'
            : 'border-gray-200 hover:border-hotel-gold/50 hover:shadow-md'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
        `}
      >
        <Calendar
          className={`
            w-5 h-5 mr-3 transition-colors duration-200
            ${isOpen ? 'text-hotel-gold' : 'text-gray-400 group-hover:text-hotel-gold'}
          `}
        />
        <span className={`flex-1 text-left ${selectedDate ? 'text-gray-800' : 'text-gray-400'}`}>
          {displayValue || placeholder}
        </span>
        {selectedDate && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div
          className="absolute z-[9999] mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 calendar-dropdown"
          style={{
            minWidth: '320px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(212, 175, 55, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-hotel-gold transition-colors" />
            </button>

            <h2
              className={`
                text-lg font-semibold text-gray-800 capitalize
                transition-all duration-300 ease-out
                ${isAnimating
                  ? slideDirection === 'left'
                    ? 'opacity-0 -translate-x-4'
                    : 'opacity-0 translate-x-4'
                  : 'opacity-100 translate-x-0'
                }
              `}
            >
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </h2>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
            >
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-hotel-gold transition-colors" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="w-10 h-8 flex items-center justify-center text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            key={currentMonth.toISOString()}
            className={`grid grid-cols-7 gap-1 ${
              slideDirection === 'left' ? 'calendar-month-enter-left' :
              slideDirection === 'right' ? 'calendar-month-enter-right' : ''
            }`}
          >
            {renderDays()}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const today = new Date()
                setCurrentMonth(today)
                handleDateClick(today)
              }}
              className="px-4 py-2 text-sm font-medium text-hotel-gold hover:bg-hotel-gold/10 rounded-lg transition-all duration-200"
            >
              Aujourd'hui
            </button>
            <span className="text-xs text-gray-400">
              {format(new Date(), 'd MMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomCalendar
