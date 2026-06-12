import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { getVisitedCountries, toggleCountry } from '../api/map'
import { getMemoriesByCountry } from '../api/memories'
import { nameToAlpha3, getFlagEmoji } from '../utils/countries'
import './Map.css'

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
const TOTAL_COUNTRIES = 195

export default function Map() {
  const [visitedCountries, setVisitedCountries] = useState([])
  const [panelCountry, setPanelCountry] = useState(null)
  const [countryMemories, setCountryMemories] = useState([])
  const [memoriesLoading, setMemoriesLoading] = useState(false)
  const [memoriesError, setMemoriesError] = useState(null)
  const [tooltip, setTooltip] = useState(null)
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

  const handleCountryClick = async (geo) => {
    const countryCode = nameToAlpha3(geo.properties.name)
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
        setVisitedCountries((prev) => [...prev, countryCode])
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

  const showTooltip = (geo, evt) => {
    const countryCode = nameToAlpha3(geo.properties.name)
    setTooltip({
      name: geo.properties.name,
      visited: visitedCountries.includes(countryCode),
      x: evt.clientX,
      y: evt.clientY
    })
  }

  const hideTooltip = () => setTooltip(null)

  return (
    <div className="map-page">
      <div className="map-header">
        <div>
          <h1>My Travel Map</h1>
          <p className="map-subtitle">Click a country to mark it visited, or revisit your memories there.</p>
        </div>
        <div className="map-counter">
          <span className="map-counter-value">{visitedCountries.length}</span>
          <span className="map-counter-divider">/ {TOTAL_COUNTRIES}</span>
          <span className="map-counter-label">countries explored</span>
        </div>
      </div>

      <div className="map-canvas">
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 175, center: [0, 20] }}
          width={980}
          height={500}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = nameToAlpha3(geo.properties.name)
                const isVisited = visitedCountries.includes(countryCode)
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountryClick(geo)}
                    onMouseEnter={(evt) => showTooltip(geo, evt)}
                    onMouseMove={(evt) => showTooltip(geo, evt)}
                    onMouseLeave={hideTooltip}
                    style={{
                      default: {
                        fill: isVisited ? '#d9a05b' : '#3d4f63',
                        stroke: 'rgba(247, 239, 223, 0.18)',
                        strokeWidth: 0.6,
                        outline: 'none'
                      },
                      hover: {
                        fill: isVisited ? '#c17f3e' : '#56697e',
                        stroke: 'rgba(247, 239, 223, 0.5)',
                        strokeWidth: 1,
                        outline: 'none',
                        cursor: 'pointer'
                      },
                      pressed: {
                        fill: '#a8503a',
                        stroke: 'rgba(247, 239, 223, 0.5)',
                        strokeWidth: 1,
                        outline: 'none'
                      }
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>

        {tooltip && (
          <div className="map-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <span className="map-tooltip-name">{tooltip.name}</span>
            <span className="map-tooltip-status">
              {tooltip.visited ? '✓ Visited' : 'Click to mark as visited'}
            </span>
          </div>
        )}
      </div>

      {panelCountry && (
        <div className="map-panel card">
          <button className="map-panel-close" onClick={closePanel} aria-label="Close panel">&times;</button>
          <h2>{getFlagEmoji(panelCountry.code)} {panelCountry.name}</h2>

          {memoriesLoading && <p>Loading memories…</p>}
          {memoriesError && <p className="error-text">{memoriesError}</p>}
          {!memoriesLoading && !memoriesError && countryMemories.length === 0 && (
            <p className="map-panel-empty">No memories yet for {panelCountry.name}.</p>
          )}

          <div className="map-panel-memories">
            {countryMemories.map((memory) => (
              <div key={memory.id} className="map-panel-memory">
                <h3>{memory.title}</h3>
                <p className="map-panel-date">
                  {new Date(memory.visitedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                {memory.description && <p className="map-panel-description">{memory.description}</p>}
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/memories/${memory.id}`)}>
                  View Full Memory
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
