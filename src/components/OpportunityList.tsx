'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Opportunity = {
  id: string
  title: string
  location: string
  link: string
}

export default function OpportunityList() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])

  useEffect(() => {
    const fetchOpportunities = async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching opportunities:', error)
      } else {
        setOpportunities(data)
      }
    }

    fetchOpportunities()
  }, [])

  return (
    <div className="space-y-4">
      {opportunities.map((opp) => (
        <div
          key={opp.id}
          className="border rounded p-4 shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold">{opp.title}</h2>
          <p className="text-sm text-gray-500">{opp.location}</p>
          <a
            href={opp.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-blue-600 underline text-sm"
          >
            View & Sign Up
          </a>
        </div>
      ))}
    </div>
  )
}
