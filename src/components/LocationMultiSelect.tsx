'use client'

import { useState, useRef, useEffect } from 'react'

type Props = {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function LocationMultiSelect({ options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleSelection = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-1/3">
<div className="relative">
  <button
    type="button"
    onClick={() => setOpen(!open)}
    className="w-full p-2 pl-9 pr-8 border rounded bg-white text-left"
  >
    <span className="text-sm">
      {selected.length > 0 ? `${selected.length} selected` : 'All Locations'}
    </span>
    <span className="absolute left-3 top-2.5 text-gray-500">📍</span>
  </button>

  <div
  className={`absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-200 ${
    selected.length > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
  }`}
>
  <button
    onClick={(e) => {
      e.stopPropagation()
      onChange([])
    }}
    className="text-gray-400 hover:text-gray-600 text-base font-bold leading-none w-6 h-6 flex items-center justify-center"
    aria-label="Clear selected filters"
  >
    ×
  </button>
</div>
</div>


      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto text-sm">
          {options.map((city) => (
            <label key={city} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(city)}
                onChange={() => toggleSelection(city)}
                className="mr-2"
              />
              {city}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
