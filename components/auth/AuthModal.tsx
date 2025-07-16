"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { toast } from "@/hooks/use-toast"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(defaultMode)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    location: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = t("auth.errors.emailRequired")
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("auth.errors.invalidEmail")
    }

    if (mode !== "forgot") {
      if (!formData.password) {
        newErrors.password = t("auth.errors.passwordRequired")
      } else if (formData.password.length < 6) {
        newErrors.password = t("auth.errors.passwordTooShort")
      }

      if (mode === "signup") {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = t("auth.errors.passwordRequired")
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = t("auth.errors.passwordMismatch")
        }

        if (!formData.fullName) {
          newErrors.fullName = t("auth.errors.nameRequired")
        }

        if (!formData.phone) {
          newErrors.phone = t("auth.errors.phoneRequired")
        }

        if (!formData.location) {
          newErrors.location = t("auth.errors.locationRequired")
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      if (mode === "login") {
        await signIn(formData.email, formData.password)
      } else if (mode === "signup") {
        await signUp(formData.email, formData.password, {
          fullName: formData.fullName,
          phone: formData.phone,
          location: formData.location,
        })
      } else if (mode === "forgot") {
        await resetPassword(formData.email)
        setMode("login")
      }

      if (mode !== "forgot") {
        onClose()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      location: "",
    })
    setErrors({})
  }

  const switchMode = (newMode: "login" | "signup" | "forgot") => {
    setMode(newMode)
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" && t("auth.loginTitle")}
            {mode === "signup" && t("auth.signupTitle")}
            {mode === "forgot" && t("auth.forgotPassword")}
          </DialogTitle>
          <DialogDescription>
            {mode === "login" && "Sign in to access your personalized civic assistant"}
            {mode === "signup" && "Create your account to get started with LokAI"}
            {mode === "forgot" && "Enter your email to reset your password"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                disabled={loading}
              />
            </div>
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Password Field */}
          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>
          )}

          {/* Signup Fields */}
          {mode === "signup" && (
            <>
              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">{t("auth.location")}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="Mumbai, Maharashtra"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
              </div>
            </>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "login" && t("auth.loginButton")}
            {mode === "signup" && t("auth.signupButton")}
            {mode === "forgot" && "Send Reset Email"}
          </Button>

          {/* Google Sign In */}
          {mode !== "forgot" && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">{t("auth.or")}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {t("auth.googleButton")}
              </Button>
            </>
          )}

          {/* Mode Switching */}
          <div className="text-center text-sm">
            {mode === "login" && (
              <>
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => switchMode("forgot")}
                  disabled={loading}
                >
                  {t("auth.forgotPassword")}
                </button>
                <div className="mt-2">
                  {t("auth.noAccount")}{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => switchMode("signup")}
                    disabled={loading}
                  >
                    {t("auth.signUp")}
                  </button>
                </div>
              </>
            )}

            {mode === "signup" && (
              <div>
                {t("auth.hasAccount")}{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => switchMode("login")}
                  disabled={loading}
                >
                  {t("auth.signIn")}
                </button>
              </div>
            )}

            {mode === "forgot" && (
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => switchMode("login")}
                disabled={loading}
              >
                Back to {t("auth.signIn")}
              </button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
