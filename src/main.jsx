import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { resumeAnalyticsIfAllowed } from '@/lib/analytics'

// Website only, and only if the visitor already said yes (see lib/googleTag.js).
resumeAnalyticsIfAllowed()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
