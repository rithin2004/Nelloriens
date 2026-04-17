/**
 * TransportCategories — RULE 31: transport categories are FIXED.
 * This page no longer exists; redirect to /transport.
 * This file should be deleted — kept only as a safe fallback.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TransportCategories() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/transport', { replace: true }) }, [navigate])
  return null
}
