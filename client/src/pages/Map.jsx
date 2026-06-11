import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { getVisitedCountries, toggleCountry } from '../api/map'
import { getMemoriesByCountry } from '../api/memories'

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function Map() {
  const [visitedCountries, setVisitedCountries] = useState([])
  const [totalCountries, setTotalCountries] = useState(177)
  const [geographies, setGeographies] = useState([])
  const [panelCountry, setPanelCountry] = useState(null)
  const [countryMemories, setCountryMemories] = useState([])
  const [memoriesLoading, setMemoriesLoading] = useState(false)
  const [memoriesError, setMemoriesError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await getVisitedCountries()
        setVisitedCountries(res.data.map((c) => c.countryCode))
      } catch (err) {
        console.error('Failed to fetch visited countries', err)
      }
    }
    fetchCountries()
  }, [])

  useEffect(() => {
    setTotalCountries(geographies.length)
  }, [geographies])

  const handleCountryClick = async (geo) => {
    const countryCode = geo.properties.ISO_A3 || geo.properties.name
    const countryName = geo.properties.name

    // already visited -> open the memories panel for this country
    if (visitedCountries.includes(countryCode)) {
      setPanelCountry({ code: countryCode, name: countryName })
      setCountryMemories([])
      setMemoriesError(null)
      setMemoriesLoading(true)
      try {
        const res = await getMemoriesByCountry(countryCode)
        setCountryMemories(res.data)
      } catch (err) {
        setMemoriesError('Failed to load memories')
      } finally {
        setMemoriesLoading(false)
      }
      return
    }

    // not visited -> mark it as visited
    try {
      const res = await toggleCountry({ countryCode, countryName })
      if (res.data.visited) {
        setVisitedCountries([...visitedCountries, countryCode])
      }
    } catch (err) {
      console.error('Failed to toggle country', err)
    }
  }

  const closePanel = () => {
    setPanelCountry(null)
    setCountryMemories([])
    setMemoriesError(null)
  }

  return (
    <div>
      <h1>My Travel Map</h1>
      <p>Visited {visitedCountries.length} / 195 countries</p>
      <ComposableMap>
        <Geographies geography={GEO_URL} onReady={({ geographies }) => setGeographies(geographies)}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isVisited = visitedCountries.includes(geo.properties.ISO_A3 || geo.properties.name)
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleCountryClick(geo)}
                  style={{
                    default: {
                      fill: isVisited ? '#F59E0B' : '#D1D5DB',
                      stroke: '#FFFFFF',
                      strokeWidth: 0.5,
                      outline: 'none'
                    },
                    hover: {
                      fill: isVisited ? '#D97706' : '#9CA3AF',
                      outline: 'none',
                      cursor: 'pointer'
                    }
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {panelCountry && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '320px',
          height: '100%',
          background: '#fff',
          borderLeft: '1px solid #D1D5DB',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <button onClick={closePanel}>Close</button>
          <h2>{panelCountry.name}</h2>

          {memoriesLoading && <p>Loading memories...</p>}
          {memoriesError && <p>{memoriesError}</p>}
          {!memoriesLoading && !memoriesError && countryMemories.length === 0 && (
            <p>No memories yet for {panelCountry.name}.</p>
          )}

          {countryMemories.map((memory) => (
            <div key={memory.id} style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <h3>{memory.title}</h3>
              <p>{new Date(memory.visitedAt).toLocaleDateString()}</p>
              <p>{memory.description}</p>
              <button onClick={() => navigate('/memories')}>View Full Memory</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}