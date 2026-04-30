// Editor.jsx — Main document editor canvas
const { useState, useRef, useEffect } = React;

const SAMPLE_PROSE = `Chapter One: The Gunslinger

The man in black fled across the desert, and the gunslinger followed.

The desert was the apotheosis of all deserts, huge, standing to the sky for what might have been parsecs in all directions. White; blinding; waterless; without feature save for the faint, cloudy haze of the mountains which sketched themselves on the horizon and the devil-grass which brought sweet dreams, nightmares, death.

An occasional tombstone sign pointed the way, for once the drifted track that cut its way through the thick crust of alkali had been a road which bore a name. That name was long since forgotten.

Roland had been on the road for three weeks now, walking steadily, rarely sleeping. He paused only to kill the occasional hare or rabbit, which he roasted over a low fire in the lee of whatever rock offered shelter from the wind — a wind that never stopped, a wind that sang in a low, mournful key that seemed to come from everywhere and nowhere at once.`;

const SAMPLE_SCREENPLAY = `EXT. DARKWOOD FOREST — NIGHT

A narrow dirt road cuts through ancient trees. Moonlight struggles through the canopy.

ELENA (30s, sharp eyes, leather jacket) walks fast, glancing back.

                    ELENA
          I told you we should have left
          before sundown.

She stops. Listens. The forest goes very quiet.

                    ELENA (CONT'D)
          Did you hear that?

A branch snaps somewhere in the darkness ahead.

                              CUT TO:

INT. ABANDONED CABIN — CONTINUOUS

Dust motes hang in the beam of Elena's flashlight. She sweeps it across rotting furniture, an overturned table, scattered papers.`;

function Editor({ isScreenplay, docId }) {
  const [content, setContent] = useState(isScreenplay ? SAMPLE_SCREENPLAY : SAMPLE_PROSE);
  const [selection, setSelection] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });
  const [aiApplied, setAiApplied] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    setContent(isScreenplay ? SAMPLE_SCREENPLAY : SAMPLE_PROSE);
  }, [isScreenplay, docId]);

  const handleMouseUp = (e) => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 10) {
      setSelection(sel.toString());
      setContextPos({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    } else {
      setShowContextMenu(false);
      setSelection(null);
    }
  };

  const handleRewriteSelected = () => {
    setShowContextMenu(false);
    setAiApplied(true);
    setTimeout(() => setAiApplied(false), 2000);
  };

  const bodyStyle = isScreenplay ? {
    fontFamily: "'Courier Prime', monospace",
    fontSize: 14,
    lineHeight: 1.7,
    color: "#1a2332",
    whiteSpace: "pre-wrap",
  } : {
    fontFamily: "'Lora', serif",
    fontSize: 16,
    lineHeight: 1.85,
    color: "#243347",
    whiteSpace: "pre-wrap",
  };

  return (
    <div style={{ flex: 1, background: "#ede9e1", overflow: "auto", display: "flex", justifyContent: "center", padding: "40px 24px", position: "relative" }}
      onClick={() => setShowContextMenu(false)}>

      {/* Page canvas */}
      <div style={{
        width: "100%", maxWidth: 680,
        background: "white",
        borderRadius: 0,
        boxShadow: "0 8px 40px rgba(26,35,50,0.14)",
        padding: isScreenplay ? "60px 80px" : "64px 72px",
        minHeight: "calc(100vh - 80px)",
        position: "relative",
      }}>
        {/* Screenplay header */}
        {isScreenplay && (
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, color: "#8a9bb0", marginBottom: 4 }}>UNTITLED SCRIPT</div>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: "#bcc8d8" }}>Written by</div>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: "#8a9bb0" }}>Author Name</div>
          </div>
        )}

        {/* Prose heading */}
        {!isScreenplay && (
          <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #ede9e1" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#1a2332", lineHeight: 1.2, marginBottom: 8 }}>The Dark Tower</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#8a9bb0" }}>Book I · 3,400 words · Last edited just now</div>
          </div>
        )}

        {/* Content */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onMouseUp={handleMouseUp}
          style={{
            ...bodyStyle,
            outline: "none",
            minHeight: 400,
          }}
        >
          {content}
        </div>

        {/* AI applied flash */}
        {aiApplied && (
          <div style={{ position: "absolute", top: 16, right: 16, background: "#ede5f9", color: "#7c5cbf", borderRadius: 4, padding: "6px 12px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, boxShadow: "0 2px 8px rgba(124,92,191,0.2)" }}>
            ✦ Rewrite applied
          </div>
        )}
      </div>

      {/* Selection context menu */}
      {showContextMenu && (
        <div style={{
          position: "fixed", left: contextPos.x, top: contextPos.y + 8, zIndex: 100,
          background: "white", borderRadius: 8, boxShadow: "0 4px 24px rgba(26,35,50,0.18)",
          border: "1px solid #d8d2c8", padding: 6, minWidth: 200,
        }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: "4px 8px 6px", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a9bb0" }}>
            {selection?.length > 60 ? selection.slice(0, 60) + "…" : selection}
          </div>
          <div style={{ height: 1, background: "#ede9e1", margin: "2px 0" }} />
          {[
            { icon: "✦", label: "Rewrite in this voice", color: "#7c5cbf", action: handleRewriteSelected },
            { icon: "✦", label: "Continue story from here", color: "#7c5cbf", action: () => setShowContextMenu(false) },
            { icon: "⬦", label: "Apply screenplay format", color: "#3d7a5a", action: () => setShowContextMenu(false) },
          ].map(item => (
            <div key={item.label} onClick={item.action} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 10px", borderRadius: 4, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1a2332",
              transition: "background 150ms ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f8f6f2"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ color: item.color, fontSize: 11, width: 14, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Editor });
