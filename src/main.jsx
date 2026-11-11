import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App.jsx'
import { captureFirstTouch } from './utils/signupSource'

captureFirstTouch()

// Signed links carry their token in ?t=, which should never reach analytics.
const hideToken = (event) => ({ ...event, url: event.url.replace(/([?&]t=)[^&#]*/, '$1hidden') })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Analytics beforeSend={hideToken} />
  </React.StrictMode>,
)
