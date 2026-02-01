"use client";

import { useState } from "react";

export default function TestLoginPage() {
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    if (!email) {
      alert("Please enter an email");
      return;
    }
    window.location.href = `/api/dev-login?email=${encodeURIComponent(email)}&callback=/apply/payment`;
  };

  return (
    <div style={{ padding: "50px", maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Test Login</h1>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Login
      </button>
    </div>
  );
}
