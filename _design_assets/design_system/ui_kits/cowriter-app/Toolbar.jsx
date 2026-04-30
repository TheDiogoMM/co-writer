// Toolbar.jsx — Editor formatting toolbar
const Toolbar = ({ isScreenplay, onToggleScreenplay, onFormat, selectedText }) => {
  const [activeFormats, setActiveFormats] = React.useState(new Set());

  const toggleFormat = (fmt) => {
    setActiveFormats(prev => {
      const n = new Set(prev);
      n.has(fmt) ? n.delete(fmt) : n.add(fmt);
      return n;
    });
    onFormat && onFormat(fmt);
  };

  const TBtn = ({ fmt, title, children }) => (
    <button title={title} onClick={() => toggleFormat(fmt)} style={{
      width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
      background: activeFormats.has(fmt) ? "#ede9e1" : "transparent",
      border: "none", borderRadius: 4, cursor: "pointer", color: "#2b3a55",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
      transition: "background 150ms ease",
    }}>{children}</button>
  );

  const Divider = () => <div style={{ width: 1, height: 20, background: "#d8d2c8", margin: "0 4px" }} />;

  return (
    <div style={{
      height: 44, background: "white", borderBottom: "1px solid #d8d2c8",
      display: "flex", alignItems: "center", padding: "0 16px", gap: 2, flexShrink: 0,
    }}>
      {/* Font picker */}
      <select style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 12, border: "1px solid #d8d2c8",
        borderRadius: 4, padding: "3px 6px", color: "#1a2332", background: "white",
        marginRight: 4, cursor: "pointer",
      }}>
        <option>Lora (Body)</option>
        <option>Playfair Display</option>
        <option>Courier Prime</option>
        <option>DM Sans</option>
      </select>

      {/* Size */}
      <select style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 12, border: "1px solid #d8d2c8",
        borderRadius: 4, padding: "3px 4px", color: "#1a2332", background: "white",
        marginRight: 4, cursor: "pointer", width: 52,
      }}>
        {[12,14,16,18,20,24,32].map(s => <option key={s}>{s}</option>)}
      </select>

      <Divider />

      <TBtn fmt="bold" title="Bold"><b>B</b></TBtn>
      <TBtn fmt="italic" title="Italic"><i style={{fontFamily:"serif"}}>I</i></TBtn>
      <TBtn fmt="underline" title="Underline"><u>U</u></TBtn>

      <Divider />

      <TBtn fmt="left" title="Align left">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
      </TBtn>
      <TBtn fmt="center" title="Center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
      </TBtn>

      <Divider />

      {/* Screenplay toggle */}
      <button onClick={onToggleScreenplay} style={{
        display: "flex", alignItems: "center", gap: 5,
        background: isScreenplay ? "#3d7a5a" : "transparent",
        color: isScreenplay ? "white" : "#3d7a5a",
        border: `1px solid ${isScreenplay ? "#3d7a5a" : "#d8d2c8"}`,
        borderRadius: 4, padding: "4px 10px", cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
        transition: "all 150ms ease", marginLeft: 4,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="13" y2="16"/></svg>
        Screenplay
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Word count */}
      <span style={{ fontSize: 11, color: "#8a9bb0", fontFamily: "'DM Sans', sans-serif" }}>
        3,400 words
      </span>

      {/* Save indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 12 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3d7a5a" }} />
        <span style={{ fontSize: 11, color: "#8a9bb0", fontFamily: "'DM Sans', sans-serif" }}>Saved</span>
      </div>
    </div>
  );
};

Object.assign(window, { Toolbar });
