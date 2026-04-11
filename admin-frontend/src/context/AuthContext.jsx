import { createContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../utils/firebase'
import { usersApi } from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null)
  const [userDoc,     setUserDoc]     = useState(null) // Firestore user document
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Fetch the Firestore user doc to get roleId, roleName, and permissions.
        // The backend never sets Firebase custom claims, so we read from our API.
        try {
          const res = await usersApi.me()
          setUserDoc(res.data?.data || res.data)
        } catch (err) {
          // 404 = Firestore user doc is gone (e.g. setup was re-run while logged in)
          // 403 = auth middleware rejected the token
          // Force logout so SetupGuard redirects to /setup
          if (err.response?.status === 404 || err.response?.status === 403) {
            await signOut(auth).catch(() => {})
          }
          // Other errors (network, 500) are non-fatal — keep the session alive
        }
      } else {
        setUser(null)
        setUserDoc(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setUserDoc(null)
  }

  const roleName    = userDoc?.roleName    || null
  const permissions = userDoc?.permissions || {}

  return (
    <AuthContext.Provider value={{ user, userDoc, roleName, permissions, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
