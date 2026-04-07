import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ConnectPage from './pages/ConnectPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import TemplatesPage from './pages/TemplatesPage.jsx'
import Layout from './components/Layout.jsx'

export default function App() {
  const [authStatus, setAuthStatus] = useState(null) // null = loading

  useEffect(() => {
    fetch('/auth/status', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setAuthStatus(data))
      .catch(() => setAuthStatus({ connected: false }))
  }, [])

  if (authStatus === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/connect" element={
          authStatus.connected
            ? <Navigate to="/dashboard" replace />
            : <ConnectPage />
        } />
        <Route element={<Layout authStatus={authStatus} setAuthStatus={setAuthStatus} />}>
          <Route path="/dashboard" element={
            authStatus.connected
              ? <DashboardPage />
              : <Navigate to="/connect" replace />
          } />
          <Route path="/templates" element={
            authStatus.connected
              ? <TemplatesPage />
              : <Navigate to="/connect" replace />
          } />
        </Route>
        <Route path="*" element={
          <Navigate to={authStatus.connected ? '/dashboard' : '/connect'} replace />
        } />
      </Routes>
    </BrowserRouter>
  )
}
