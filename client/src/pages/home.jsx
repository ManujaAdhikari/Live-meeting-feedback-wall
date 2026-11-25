import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../config";


export default function Home() {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  async function createSession() {
    if (!title.trim()) return;
    const res = await fetch(`${API}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const session = await res.json();
    localStorage.setItem("hostKey:" + session.code, session.hostKey);
    navigate(`/host/${session.code}`);
  }

  function joinSession() {
    if (!code.trim()) return;
    navigate(`/join/${code.trim().toUpperCase()}`);
  }
  return (
    <div>
      <h1>Live Meeting Feedback Wall</h1>
      <p className="muted">Collect and rank questions from your audience, live.</p>

      <div className="card">
        <h2>Host a meeting</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title" />
        <button onClick={createSession}>Create session</button>
      </div>

      <div className="card">
        <h2>Join a meeting</h2>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Session code" />
        <button onClick={joinSession}>Join</button>
      </div>
    </div>
  );
 
}