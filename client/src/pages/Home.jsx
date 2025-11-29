import React from "react";

export default function Home() {
  return (
    <div
      style={{
        backgroundColor: "#000218",
        height: "100vh",
        width: "100%",
        color: "white",
        fontFamily: "monospace",
        position: "relative",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          position: "absolute",
          top: "20px",
          right: "40px",
          display: "flex",
          gap: "30px",
          fontSize: "1.3rem",
        }}
      >
        <a href="#" style={linkStyle}>About</a>
        <a href="#" style={linkStyle}>Log In</a>
        <a href="#" style={linkStyle}>Sign up</a>
      </nav>

      {/* CENTER LOGO */}
      <div
        style={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "6rem",
          fontWeight: "bold",
          letterSpacing: "4px",
        }}
      >
        LeetSee
      </div>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  cursor: "pointer",
};
