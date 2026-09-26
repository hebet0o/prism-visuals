import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './i18n/config.js'

const languagePrefix = window.location.pathname.match(/^\/(hu|en)(?=\/|$)/)?.[0]
const root = document.getElementById('root')
const app = (
  <React.StrictMode>
    <BrowserRouter basename={languagePrefix || "/"}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

if (root.hasChildNodes()) ReactDOM.hydrateRoot(root, app)
else ReactDOM.createRoot(root).render(app)
