import { useState, useEffect } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { getVisitedCountries, toggleCountry } from '../api/map'

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function Map() {
  const [visitedCountries, setVisitedCountries] = useState([])
  const [totalCountries, setTotalCountries] = useState(177)
  const [geographies, setGeographies] = useState([])

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
    try {
      const res = await toggleCountry({ countryCode, countryName })
      if (res.data.visited) {
        setVisitedCountries([...visitedCountries, countryCode])
      } else {
        setVisitedCountries(visitedCountries.filter((c) => c !== countryCode))
      }
    } catch (err) {
      console.error('Failed to toggle country', err)
    }
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
    </div>
  )
}