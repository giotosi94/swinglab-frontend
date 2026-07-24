import React, { useState } from "react";

export default function InfoTip({ text }) {
  const [show, setShow] = useState(false);

  return (
    <span style={{ position: "relative", display: "inline-flex", marginLeft: 5, verticalAlign: "middle" }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((s) => !s)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#334155",
          color: "#94a3b8",
          fontSize: 10,
          fontWeight: 700,
          cursor: "help",
          userSelect: "none",
        }}
      >
        i
      </span>
      {show && (
        <span
          style={{
            position: "absolute",
            bottom: "140%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 220,
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 11,
            lineHeight: 1.4,
            color: "#e2e8f0",
            fontWeight: 400,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            zIndex: 2000,
            textAlign: "left",
            whiteSpace: "normal",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
