"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"

interface LocationData {
  latitude: number
  longitude: number
  city: string
  state: string
  country: string
  address: string
}

interface LocationContextType {
  location: LocationData | null
  loading: boolean
  error: string | null
  getCurrentLocation: () => Promise<void>
  setManualLocation: (location: Partial<LocationData>) => void
  clearLocation: () => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
}

interface LocationProviderProps {
  children: ReactNode
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load location from localStorage
    const savedLocation = localStorage.getItem("userLocation")
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation))
      } catch (error) {
        console.error("Error parsing saved location:", error)
      }
    }
  }, [])

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords

      // Reverse geocoding to get address
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}`,
      )

      if (!response.ok) {
        throw new Error("Failed to get location details")
      }

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        const components = result.components

        const locationData: LocationData = {
          latitude,
          longitude,
          city: components.city || components.town || components.village || "",
          state: components.state || "",
          country: components.country || "",
          address: result.formatted,
        }

        setLocation(locationData)
        localStorage.setItem("userLocation", JSON.stringify(locationData))

        toast({
          title: "Location detected",
          description: `${locationData.city}, ${locationData.state}`,
        })
      }
    } catch (error: any) {
      console.error("Location error:", error)

      let errorMessage = "Failed to get location"

      if (error.code === 1) {
        errorMessage = "Location access denied. Please enable location permissions."
      } else if (error.code === 2) {
        errorMessage = "Location unavailable. Please try again."
      } else if (error.code === 3) {
        errorMessage = "Location request timed out. Please try again."
      }

      setError(errorMessage)
      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const setManualLocation = (locationData: Partial<LocationData>) => {
    const newLocation: LocationData = {
      latitude: 0,
      longitude: 0,
      city: locationData.city || "",
      state: locationData.state || "",
      country: locationData.country || "India",
      address: `${locationData.city}, ${locationData.state}`,
      ...locationData,
    }

    setLocation(newLocation)
    localStorage.setItem("userLocation", JSON.stringify(newLocation))
    setError(null)

    toast({
      title: "Location updated",
      description: newLocation.address,
    })
  }

  const clearLocation = () => {
    setLocation(null)
    localStorage.removeItem("userLocation")
    setError(null)
  }

  const value = {
    location,
    loading,
    error,
    getCurrentLocation,
    setManualLocation,
    clearLocation,
  }

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}
