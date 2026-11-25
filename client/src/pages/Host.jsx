import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { socket } from "../socket";
import { API } from "../config";

export default function Host() {
  const { code } = useParams();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const hostKey = localStorage.getItem("hostKey:" + code);

  useEffect(() => {
    fetch(`${API}/api/sessions/${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.session) {
          setTitle(data.session.title);
          setQuestions(data.questions);
        } else {
          setTitle("Session not found");
        }
      });

    socket.emit("join-session", code);

    const onAdded = (q) => setQuestions((prev) => [...prev, q]);
    const onUpdated = (q) =>
      setQuestions((prev) => prev.map((x) => (x._id === q._id ? q : x)));

    socket.on("question:added", onAdded);
    socket.on("question:updated", onUpdated);

    return () => {
      socket.off("question:added", onAdded);
      socket.off("question:updated", onUpdated);
    };
  }, [code]);

  function setStatus(id, status) {
    socket.emit("question:status", { code, id, status, hostKey });
  }

  const joinLink = `${window.location.origin}/join/${code}`;
  const sorted = [...questions].sort(
    (a, b) => (a.status === "answered") - (b.status === "answered") || b.votes - a.votes
  );
  return (
    <div>
      <h1>{title}</h1>
      {!hostKey && <p className="muted">View only. Open this page in the browser that created the session to manage questions.</p>}

      <div className="card">
        <p>Session code: <b>{code}</b></p>
        <p className="muted">{joinLink}</p>
        <QRCodeSVG value={joinLink} size={160} />
      </div>

      <h2>Questions ({questions.length})</h2>
      {sorted.length === 0 && <p className="muted">No questions yet.</p>}
      <ol>
        {sorted.map((q) => (
          <li key={q._id} style={{ opacity: q.status === "hidden" ? 0.4 : 1 }}>
            <div>
              {q.status === "answered" && "[Answered] "}
              {q.text}
              <div className="votes">{q.votes} votes</div>
            </div>
            {hostKey && (
              <div className="actions">
                <button className="secondary" onClick={() => setStatus(q._id, q.status === "answered" ? "visible" : "answered")}>
                  {q.status === "answered" ? "Unmark" : "Answered"}
                </button>
                <button className="secondary" onClick={() => setStatus(q._id, q.status === "hidden" ? "visible" : "hidden")}>
                  {q.status === "hidden" ? "Show" : "Hide"}
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
 