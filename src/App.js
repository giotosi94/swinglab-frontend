/* ==========================================
   SwingLab — App.css (Mobile Responsive)
   ========================================== */

/* ---- Base ---- */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background: #0a0e17;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ---- Scrollbar ---- */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #0f172a;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* ---- Input/Select focus ---- */
input:focus, select:focus, button:focus {
  outline: none;
}

/* ---- Range slider ---- */
input[type="range"] {
  -webkit-appearance: none;
  height: 4px;
  background: #334155;
  border-radius: 2px;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

/* ==========================================
   MOBILE RESPONSIVE (< 768px)
   ========================================== */
@media (max-width: 768px) {
  /* Metrics → 4 columns */
  div[style*="minmax(100px"] {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 4px !important;
  }

  /* Stock cards → single column */
  div[style*="minmax(280px"] {
    grid-template-columns: 1fr !important;
  }

  /* Settings → single column */
  div[style*="minmax(320px"] {
    grid-template-columns: 1fr !important;
  }

  /* Sector heatmap → 3 columns */
  div[style*="minmax(120px"] {
    grid-template-columns: repeat(3, 1fr) !important;
  }

  /* Agent pipeline → smaller */
  div[style*="minWidth: 130"] {
    min-width: 100px !important;
    padding: 8px 10px !important;
  }

  /* Headers smaller */
  h2 {
    font-size: 18px !important;
  }
  h3 {
    font-size: 14px !important;
  }
}

/* ==========================================
   SMALL MOBILE (< 480px)
   ========================================== */
@media (max-width: 480px) {
  /* Metrics → 2 columns */
  div[style*="minmax(100px"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  div[style*="minmax(150px"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  div[style*="minmax(130px"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  /* Sector heatmap → 2 columns */
  div[style*="minmax(120px"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  /* Agent pipeline → very small */
  div[style*="minWidth: 130"] {
    min-width: 70px !important;
    padding: 6px 8px !important;
  }

  /* Font sizes */
  h2 {
    font-size: 16px !important;
  }
}

/* ==========================================
   TOAST NOTIFICATIONS
   ========================================== */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  animation: slideIn 0.3s ease-out;
  max-width: 350px;
}

.toast-success {
  border-left: 3px solid #22c55e;
}

.toast-error {
  border-left: 3px solid #ef4444;
}

.toast-info {
  border-left: 3px solid #3b82f6;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* ==========================================
   LOADING SKELETON
   ========================================== */
.skeleton {
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
