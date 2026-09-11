import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { listingToProperty, type Listing, type Property } from '@/types'

export function useListings(status = 'active') {
  const [listings, setListings] = useState<Listing[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    if (error) {
      setError(error.message)
      setListings([])
      setProperties([])
    } else {
      const rows = (data as Listing[] | null) ?? []
      setListings(rows)
      setProperties(rows.map(listingToProperty))
    }
    setLoading(false)
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  return { listings, properties, loading, error, reload: load }
}

export function useListingById(id: string | undefined) {
  const [listing, setListing] = useState<Listing | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (cancelled) return
      if (error || !data) {
        setListing(null)
        setProperty(null)
      } else {
        const row = data as Listing
        setListing(row)
        setProperty(listingToProperty(row))
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  return { listing, property, loading }
}
