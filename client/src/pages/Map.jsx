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
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [actionMenuPos, setActionMenuPos] = useState(null)
  const [countryMemories, setCountryMemories] = useState([])
  const [memoriesLoading, setMemoriesLoading] = useState(false)
  const [memoriesError, setMemoriesError] = useState(null)
  const [removeBlocked, setRemoveBlocked] = useState(false)
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

  const handleCountryClick = async (geo, evt) => {
    evt.stopPropagation()
    const countryCode = nameToAlpha3(geo.properties.name)
    const countryName = geo.properties.name

    setSelectedCountry({ code: countryCode, name: countryName })
    setActionMenuPos({ x: evt.clientX, y: evt.clientY })
    setRemoveBlocked(false)
    setTooltip(null)

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
  }

  const handleAddToVisited = async () => {
    if (!selectedCountry || visitedCountries.includes(selectedCountry.code)) return
    try {
      const res = await toggleCountry({ countryCode: selectedCountry.code, countryName: selectedCountry.name })
      if (res.data.visited) {
        setVisitedCountries((prev) => [...prev, selectedCountry.code])
      }
    } catch (err) {
      console.error('Failed to mark country as visited', err)
    }
  }

  const handleRemoveFromVisited = async () => {
    if (!selectedCountry || !visitedCountries.includes(selectedCountry.code)) return

    if (countryMemories.length > 0) {
      setRemoveBlocked(true)
      return
    }

    try {
      const res = await toggleCountry({ countryCode: selectedCountry.code, countryName: selectedCountry.name })
      if (!res.data.visited) {
        setVisitedCountries((prev) => prev.filter((code) => code !== selectedCountry.code))
      }
    } catch (err) {
      console.error('Failed to remove country from visited', err)
    }
  }

  const handleCreateMemory = () => {
    if (!selectedCountry) return
    navigate('/memories/create', {
      state: { countryCode: selectedCountry.code, countryName: selectedCountry.name }
    })
  }

  const closePanel = () => {
    setSelectedCountry(null)
    setActionMenuPos(null)
    setCountryMemories([])
    setMemoriesError(null)
    setRemoveBlocked(false)
  }

  useEffect(() => {
    if (!selectedCountry) return

    const handleClickOutside = (evt) => {
      if (evt.target.closest('.map-action-menu') || evt.target.closest('.map-panel')) return
      closePanel()
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [selectedCountry])

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

  const isSelectedVisited = selectedCountry ? visitedCountries.includes(selectedCountry.code) : false

  return (
    <div className="map-page">
      <div className="map-header">
        <div>
          <h1>My Travel Map</h1>
          <p className="map-subtitle">Click a country to mark it visited, add a memory, or remove it from your list.</p>
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
                    onClick={(evt) => handleCountryClick(geo, evt)}
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
              {tooltip.visited ? '✓ Visited' : 'Not visited yet'}
            </span>
          </div>
        )}

        {selectedCountry && actionMenuPos && (
          <div className="map-action-menu" style={{ left: actionMenuPos.x, top: actionMenuPos.y }}>
            <div className="map-action-menu-title">
              {getFlagEmoji(selectedCountry.code)} {selectedCountry.name}
            </div>
            <button
              className="map-action-btn"
              onClick={handleAddToVisited}
              disabled={isSelectedVisited}
            >
              {isSelectedVisited ? '✓ Visited' : 'Add to Visited'}
            </button>
            <button className="map-action-btn" onClick={handleCreateMemory}>
              Create Memory
            </button>
            <button
              className="map-action-btn map-action-btn-danger"
              onClick={handleRemoveFromVisited}
              disabled={!isSelectedVisited}
            >
              Remove from Visited
            </button>
            {removeBlocked && (
              <p className="map-action-warning">
                This country has {countryMemories.length} {countryMemories.length === 1 ? 'memory' : 'memories'}.
                Delete {countryMemories.length === 1 ? 'it' : 'them'} first before removing this country from your visited list.
              </p>
            )}
          </div>
        )}
      </div>

      {selectedCountry && (
        <div className="map-panel card">
          <button className="map-panel-close" onClick={closePanel} aria-label="Close panel">&times;</button>
          <h2>{getFlagEmoji(selectedCountry.code)} {selectedCountry.name}</h2>

          {memoriesLoading && <p>Loading memories…</p>}
          {memoriesError && <p className="error-text">{memoriesError}</p>}
          {!memoriesLoading && !memoriesError && countryMemories.length === 0 && (
            <p className="map-panel-empty">No memories yet for {selectedCountry.name}.</p>
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
