import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.tsx'
import { useAuthStore } from './store/authStore.ts'
import './index.css'

// Initialize auth before rendering
useAuthStore.getState().initializeAuth()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
