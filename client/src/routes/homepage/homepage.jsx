import { useState } from 'react';
import { Link } from 'react-router';
import './homepage.css'
import Gallery from "../../components/gallery/gallery";

const Homepage = () => {
  const [layoutMode, setLayoutMode] = useState('default');

  return (
    <div className="homepage">
      <div className="layoutToggleContainer" style={{ padding: "0 20px 20px 20px", display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center" }}>
        <Link 
          to="/saved"
          style={{ 
            marginRight: "auto",
            padding: "8px 16px", 
            borderRadius: "24px", 
            border: "1px solid #ddd",
            background: "transparent",
            color: "#111",
            textDecoration: "none",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          Saved Pins
        </Link>
        <button 
          onClick={() => setLayoutMode('default')}
          style={{ 
            padding: "8px 16px", 
            borderRadius: "24px", 
            border: "none", 
            cursor: "pointer",
            fontWeight: "bold",
            background: layoutMode === 'default' ? "#111" : "#efefef",
            color: layoutMode === 'default' ? "#fff" : "#111"
          }}
        >
          Default View
        </button>
        <button 
          onClick={() => setLayoutMode('compact')}
          style={{ 
            padding: "8px 16px", 
            borderRadius: "24px", 
            border: "none", 
            cursor: "pointer",
            fontWeight: "bold",
            background: layoutMode === 'compact' ? "#111" : "#efefef",
            color: layoutMode === 'compact' ? "#fff" : "#111"
          }}
        >
          Compact View
        </button>
      </div>
      <Gallery layoutMode={layoutMode} />
    </div>
  )
}

export default Homepage