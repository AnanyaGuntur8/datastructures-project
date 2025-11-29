import React from "react";

export default function Login() {
  return (
    <div
      style={{
        backgroundColor: "#000218",
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      {/* --- MAIN CONTAINER --- */}
      <div
        style={{
          display: "flex",
          width: "80%",
          height: "70%",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* --- LEFT: GLASS LOGIN CARD --- */}
        <div
          style={{
            width: "40%",
            padding: "40px",
            background: "rgba(255, 255, 255, 0.09)",
            borderRadius: "20px",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
          }}
        >
          <h1 style={{ marginBottom: "40px" }}>Log in</h1>

          <label>Email</label>
          <input
            type="email"
            style={inputStyle}
            placeholder="Enter your email"
          />

          <label style={{ marginTop: "25px" }}>Password</label>
          <input
            type="password"
            style={inputStyle}
            placeholder="Enter your password"
          />
        </div>

        {/* --- RIGHT SIDE: IMAGE OR PLACEHOLDER --- */}
        <div
          style={{
            width: "50%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "30px",
            color: "white",
            fontSize: "1.5rem",
          }}
        >
          <div>guy waving hi</div>

          {/* Placeholder box for your image */}
          <div
            style={{
              width: "90px",
              height: "90px",
              backgroundColor: "#dcdcdc",
              borderRadius: "6px",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 15px",
  marginTop: "8px",
  borderRadius: "10px",
  border: "2px solid #3d3b75",
  backgroundColor: "rgba(255,255,255,0.05)",
  color: "white",
  fontSize: "1rem",
  outline: "none",
};
