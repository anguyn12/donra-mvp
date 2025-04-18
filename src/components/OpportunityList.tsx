'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Opportunity = {
  id: string
  title: string
  location: string
  time: string
  description: string
  link: string
  source?: string
}

type Props = {
  opportunities: Opportunity[]
}

export default function OpportunityList({ opportunities }: Props) {
  if (!opportunities || opportunities.length === 0) {
    return <p className="text-center text-gray-400 text-sm">No opportunities found.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {opportunities.map((opp) => (
      <div
        key={`${opp.title}-${opp.link}`}
        className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition-all"
      >
        <h3 className="text-lg font-medium">{opp.title}</h3>
        <p className="text-sm text-gray-500 mt-1">📍 {opp.location}</p>
        <p className="text-sm text-gray-400">🕒 {opp.time}</p>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{opp.description}</p>
        <a
          href={opp.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm text-blue-600 hover:underline"
        >
          View Opportunity →
        </a>
      </div>
    ))}
  </div>
  
  )
}