// Sidebar.jsx — Co-Writer left navigation panel
const { useState } = React;

const DOCS = [
  { id: 1, title: "The Dark Tower", words: "3,400", excerpt: "The man in black fled across the desert…", active: true },
  { id: 2, title: "Pulp Fiction — Scene 4", words: "890", excerpt: "INT. DINER — DAY", screenplay: true },
  { id: 3, title: "Short Story Draft", words: "1,200", excerpt: "It began with the smell of old books…" },
  { id: 4, title: "Midnight Children", words: "520", excerpt: "She arrived on the night of the storm." },
];

function Sidebar({ activeDoc, onSelectDoc, onNewDoc }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{
      width: collapsed ? 48 : 240,
      minWidth: collapsed ? 48 : 240,
      background: "#ede9e1",
      borderRight: "1px solid #d8d2c8",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      transition: "width 250ms cubic-bezier(0.25,0.1,0.25,1), min-width 250ms cubic-bezier(0.25,0.1,0.25,1)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "0 12px", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #d8d2c8", flexShrink: 0 }}>
        {!collapsed && (
          <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 16, letterSpacing: "0.02em", color: "#1a2332" }}>
            CO-WRITER
          </span>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#8a9bb0", display: "flex", alignItems: "center", marginLeft: "auto" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {collapsed ? <path d="M9 18l6-6-6-6"/> : <path d="M15 18l-6-6 6-6"/>}
          </svg>
        </button>
      </div>

      {!collapsed && (
        <>
          {/* New doc button */}
          <div style={{ padding: "10px 12px", flexShrink: 0 }}>
            <button onClick={onNewDoc} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8,
              background: "#b8956a", color: "white", border: "none",
              borderRadius: 4, padding: "8px 12px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New document
            </button>
          </div>

          {/* Section label */}
          <div style={{ padding: "4px 14px 6px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a9bb0" }}>
            My Documents
          </div>

          {/* Doc list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}>
            {DOCS.map(doc => (
              <div key={doc.id} onClick={() => onSelectDoc(doc.id)}
                style={{
                  padding: "9px 10px",
                  borderRadius: 4,
                  cursor: "pointer",
                  marginBottom: 2,
                  background: activeDoc === doc.id ? "white" : "transparent",
                  borderLeft: activeDoc === doc.id ? "2px solid #b8956a" : "2px solid transparent",
                  transition: "all 150ms ease",
                }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: activeDoc === doc.id ? 600 : 400, color: "#1a2332", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {doc.title}
                  </span>
                  {doc.screenplay && (
                    <span style={{ fontSize: 9, fontWeight: 600, color: "#3d7a5a", background: "#d8f0e4", borderRadius: 999, padding: "1px 5px", flexShrink: 0 }}>SCR</span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: "#8a9bb0", marginTop: 2 }}>{doc.words} words</div>
              </div>
            ))}
          </div>

          {/* Bottom nav */}
          <div style={{ borderTop: "1px solid #d8d2c8", padding: "8px" }}>
            {[
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: "Personas" },
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>, label: "Settings" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 4, cursor: "pointer", color: "#4a607e" }}>
                {item.icon}
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { Sidebar, DOCS });
