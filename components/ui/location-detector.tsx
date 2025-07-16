"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLocation } from "@/contexts/LocationContext"
import { useLanguage } from "@/contexts/LanguageContext"

export function LocationDetector() {
  const [isOpen, setIsOpen] = useState(false)
  const [manualLocation, setManualLocationInput] = useState("")
  const { location, loading, error, getCurrentLocation, setManualLocation } = useLocation()
  const { t } = useLanguage()

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualLocation.trim()) {
      const [city, state] = manualLocation.split(",").map((s) => s.trim())
      setManualLocation({
        city: city || manualLocation,
        state: state || "",
        country: "India",
      })
      setIsOpen(false)
      setManualLocationInput("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center bg-transparent">
          <MapPin className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">
            {location ? `${location.city}, ${location.state}` : t("location.enable")}
          </span>
          <span className="sm:hidden">{location ? location.city : t("common.location")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            {t("common.location")}
          </DialogTitle>
          <DialogDescription>
            Enable location access for personalized civic updates and local information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Location Display */}
          {location && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center text-green-800 dark:text-green-200">
                <MapPin className="mr-2 h-4 w-4" />
                <span className="font-medium">{t("location.detected")}</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">{location.address}</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center text-red-800 dark:text-red-200">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span className="font-medium">{t("location.failed")}</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          )}

          {/* Auto-detect Button */}
          <Button onClick={getCurrentLocation} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("location.detecting")}
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Detect My Location
              </>
            )}
          </Button>

          {/* Manual Entry */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t("location.manual")}</span>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <Label htmlFor="manual-location">City, State</Label>
              <Input
                id="manual-location"
                type="text"
                placeholder={t("location.placeholder")}
                value={manualLocation}
                onChange={(e) => setManualLocationInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline" className="w-full bg-transparent">
              Set Location
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
