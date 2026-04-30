// PersonaPanel.jsx — Right AI persona panel
const { useState } = React;

const PERSONAS = [
  { id: "king",     name: "Stephen King",      genre: "Horror · Thriller",  initials: "K",  bg: "linear-gradient(135deg,#2b3a55,#1a2332)" },
  { id: "tarantino",name: "Tarantino",          genre: "Screenplay · Pulp",  initials: "T",  bg: "linear-gradient(135deg,#9a7a52,#7a5c35)" },
  { id: "tolkien",  name: "J.R.R. Tolkien",    genre: "Fantasy · Epic",     initials: "To", bg: "linear-gradient(135deg,#3d7a5a,#2a5c3f)" },
  { id: "gaiman",   name: "Neil Gaiman",        genre: "Fantasy · Myth",     initials: "G",  bg: "linear-gradient(135deg,#7c5cbf,#5e3fa3)" },
  { id: "lovecraft",name: "H.P. Lovecraft",     genre: "Horror · Gothic",    initials: "L",  bg: "linear-gradient(135deg,#4a607e,#2b3a55)" },
  { id: "nolan",    name: "Christopher Nolan",  genre: "Thriller · Sci-Fi",  initials: "N",  bg: "linear-gradient(135deg,#c9a227,#9a7a52)" },
];

const SUGGESTIONS = [
  "King often builds dread through mundane detail — consider slowing this moment down.",
  "A longer sentence here would mirror the weight of the scene.",
  "This dialogue feels too clean. King's characters stumble, repeat, trail off.",
];

function PersonaPanel({ selectedText, onRewrite, onContinue }) {
  const [activePersona, setActivePersona] = useState("king");
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewritten, setRewritten] = useState(null);
  const [suggIdx, setSuggIdx] = useState(0);

  const persona = PERSONAS.find(p => p.id === activePersona);

  const handleRewrite = () => {
    setIsRewriting(true);
    setRewritten(null);
    setTimeout(() => {
      setIsRewriting(false);
      setRewritten("The darkness came for him slow, the way bad things always do — not all at once but piece by piece, the way a tide takes a sandcastle.");
      setSuggIdx((suggIdx + 1) % SUGGESTIONS.length);
    }, 1800);
    onRewrite && onRewrite(activePersona);
  };

  const handleContinue = () => {
    setIsRewriting(true);
    setTimeout(() => {
      setIsRewriting(false);
      onContinue && onContinue();
    }, 1400);
  };

  return (
    <div style={{
      width: 280, minWidth: 280, background: "#f8f6f2",
      borderLeft: "1px solid #d8d2c8", display: "flex", flexDirection: "column",
      height: "100%", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "0 16px", height: 44, display: "flex", alignItems: "center", borderBottom: "1px solid #d8d2c8", flexShrink: 0 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4a607e" }}>Persona</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: "#7c5cbf", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", background: "#ede5f9", borderRadius: 999, padding: "2px 7px" }}>✦ AI</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>

        {/* Active persona display */}
        <div style={{ background: "white", border: "1px solid #d8d2c8", borderRadius: 8, padding: "12px", marginBottom: 12, boxShadow: "0 2px 8px rgba(26,35,50,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: persona.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, fontStyle: "italic", color: "white", flexShrink: 0 }}>
              {persona.initials}
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: "#1a2332" }}>{persona.name}</div>
              <div style={{ fontSize: 10, color: "#8a9bb0" }}>{persona.genre}</div>
            </div>
            <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#3d7a5a" }} />
          </div>

          {/* AI actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={handleRewrite} disabled={isRewriting} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: isRewriting ? "#ede5f9" : "#7c5cbf", color: isRewriting ? "#7c5cbf" : "white",
              border: "none", borderRadius: 4, padding: "9px", cursor: isRewriting ? "default" : "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
              transition: "all 150ms ease",
            }}>
              {isRewriting ? (
                <><span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 14 }}>◌</span> Rewriting…</>
              ) : (
                <>✦ Rewrite in this voice</>
              )}
            </button>
            <button onClick={handleContinue} disabled={isRewriting} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: "transparent", color: "#7c5cbf",
              border: "1.5px solid #7c5cbf", borderRadius: 4, padding: "8px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            }}>
              ✦ Continue story
            </button>
          </div>
        </div>

        {/* Rewrite result */}
        {rewritten && (
          <div style={{ background: "#ede5f9", borderRadius: 8, padding: 12, marginBottom: 12, border: "1px solid rgba(124,92,191,0.2)" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#7c5cbf", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Rewritten passage</div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 13, lineHeight: 1.6, color: "#243347", fontStyle: "italic" }}>"{rewritten}"</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button style={{ flex: 1, background: "#7c5cbf", color: "white", border: "none", borderRadius: 4, padding: "6px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600 }}>Apply</button>
              <button style={{ flex: 1, background: "transparent", color: "#8a9bb0", border: "1px solid #d8d2c8", borderRadius: 4, padding: "6px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>Dismiss</button>
            </div>
          </div>
        )}

        {/* AI suggestion */}
        <div style={{ background: "white", border: "1px solid #d8d2c8", borderRadius: 8, padding: 12, marginBottom: 12, boxShadow: "0 1px 3px rgba(26,35,50,0.06)" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#4a607e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Voice note</div>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 12, lineHeight: 1.6, color: "#2b3a55", fontStyle: "italic" }}>"{SUGGESTIONS[suggIdx]}"</div>
        </div>

        {/* Persona picker */}
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a9bb0", marginBottom: 8 }}>Switch persona</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {PERSONAS.map(p => (
            <div key={p.id} onClick={() => setActivePersona(p.id)} style={{
              background: activePersona === p.id ? "white" : "transparent",
              border: `1.5px solid ${activePersona === p.id ? "#7c5cbf" : "#d8d2c8"}`,
              borderRadius: 8, padding: "8px 8px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7,
              boxShadow: activePersona === p.id ? "0 0 0 3px rgba(124,92,191,0.12)" : "none",
              transition: "all 150ms ease",
            }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: 11, fontWeight: 700, fontStyle: "italic", color: "white", flexShrink: 0 }}>{p.initials}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: "#1a2332", lineHeight: 1.2 }}>{p.name.split(" ").slice(-1)[0]}</div>
            </div>
          ))}
          <div style={{ border: "1.5px dashed #d8d2c8", borderRadius: 8, padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#ede9e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#8a9bb0", fontSize: 18, flexShrink: 0 }}>+</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#8a9bb0", lineHeight: 1.2 }}>Add persona</div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

Object.assign(window, { PersonaPanel, PERSONAS });
