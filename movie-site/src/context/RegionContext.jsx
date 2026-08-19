import { createContext, useContext, useState, useEffect } from 'react'

export const REGIONS = [
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
  { code: 'IN', label: 'India' },
  { code: 'FR', label: 'France' },
  { code: 'DE', label: 'Germany' },
  { code: 'JP', label: 'Japan' },
]

const RegionContext = createContext(null)

export function RegionProvider({ children }) {
  const [region, setRegion] = useState(() => localStorage.getItem('reel_region') || 'US')

  useEffect(() => {
    localStorage.setItem('reel_region', region)
  }, [region])

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  )
}

export function useRegion() {
  const ctx = useContext(RegionContext)
  if (!ctx) throw new Error('useRegion must be used within a RegionProvider')
  return ctx
}
