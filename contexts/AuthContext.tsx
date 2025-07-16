"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, googleProvider, db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  phone?: string
  location?: string
  createdAt: Date
  lastLoginAt: Date
  preferences: {
    language: string
    theme: string
    notifications: boolean
  }
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)

      // Update last login time
      await setDoc(
        doc(db, "users", result.user.uid),
        {
          lastLoginAt: new Date(),
        },
        { merge: true },
      )

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })
    } catch (error: any) {
      console.error("Sign in error:", error)
      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)

      // Update user profile
      await updateProfile(result.user, {
        displayName: userData.fullName,
      })

      // Create user document in Firestore
      const userProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email!,
        displayName: userData.fullName,
        phone: userData.phone,
        location: userData.location,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          language: "en",
          theme: "light",
          notifications: true,
        },
      }

      await setDoc(doc(db, "users", result.user.uid), userProfile)
      setUserProfile(userProfile)

      toast({
        title: "Account created!",
        description: "Welcome to LokAI. Your account has been created successfully.",
      })
    } catch (error: any) {
      console.error("Sign up error:", error)
      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)

      // Check if user document exists, if not create one
      const userDoc = await getDoc(doc(db, "users", result.user.uid))

      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName!,
          photoURL: result.user.photoURL || undefined,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          preferences: {
            language: "en",
            theme: "light",
            notifications: true,
          },
        }

        await setDoc(doc(db, "users", result.user.uid), userProfile)
        setUserProfile(userProfile)
      } else {
        // Update last login time
        await setDoc(
          doc(db, "users", result.user.uid),
          {
            lastLoginAt: new Date(),
          },
          { merge: true },
        )
      }

      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      })
    } catch (error: any) {
      console.error("Google sign in error:", error)
      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUserProfile(null)
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error: any) {
      console.error("Logout error:", error)
      throw new Error("Failed to sign out")
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions.",
      })
    } catch (error: any) {
      console.error("Password reset error:", error)
      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("No user logged in")

    try {
      await setDoc(doc(db, "users", user.uid), data, { merge: true })

      if (userProfile) {
        setUserProfile({ ...userProfile, ...data })
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      console.error("Profile update error:", error)
      throw new Error("Failed to update profile")
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No account found with this email address."
    case "auth/wrong-password":
      return "Incorrect password."
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/weak-password":
      return "Password should be at least 6 characters."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later."
    case "auth/network-request-failed":
      return "Network error. Please check your connection."
    default:
      return "An error occurred. Please try again."
  }
}
