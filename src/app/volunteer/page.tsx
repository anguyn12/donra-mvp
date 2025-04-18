'use client'

import OpportunityList from '../../components/OpportunityList'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import LocationMultiSelect from '../../components/LocationMultiSelect'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Opportunity = {
  id: string
  title: string
  location: string
  time: string
  description: string
  link: string
  source?: string
}

export default function VolunteerPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [filtered, setFiltered] = useState<Opportunity[]>([])
  const [cityFilter, setCityFilter] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setOpportunities(data)
        setFiltered(data)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    let filteredData = [...opportunities]

    if (cityFilter.length > 0) {
      filteredData = filteredData.filter((opp) =>
        cityFilter.includes(opp.location)
      )
    }

    if (searchQuery) {
      filteredData = filteredData.filter((opp) =>
        (opp.title + opp.description)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    }

    setFiltered(filteredData)
    setPage(1)
  }, [cityFilter, searchQuery, opportunities])

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  return (
    <div className="min-h-screen bg-[#f6f5f4] text-gray-900">
      <div className="max-w-5xl mx-auto p-6 sm:p-10">
        <h1 className="text-3xl font-semibold mb-6 tracking-tight">Volunteer Opportunities</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white shadow-sm rounded-xl p-4 border border-gray-200">
        <input
            type="text"
            placeholder="Search opportunities..."
            className="p-2 border rounded w-full sm:w-2/3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        <LocationMultiSelect
  options={[...new Set(opportunities.map((opp) => opp.location))]}
  selected={cityFilter}
  onChange={setCityFilter}
/>



        </div>

        <OpportunityList opportunities={paginated} />

        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}