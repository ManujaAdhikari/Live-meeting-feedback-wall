import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket";

const API = "http://localhost:5000";

export default function Host() {
  const { code } = useParams();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);

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

  const joinLink = `${window.location.origin}/join/${code}`;
  const sorted = [...questions].sort((a, b) => b.votes - a.votes);

  return (
    <div>
      <h1>{title}</h1>
      <p>Session code: <b>{code}</b></p>
      <p>Share this link: {joinLink}</p>

      <h2>Questions ({questions.length})</h2>
      {sorted.length === 0 && <p>No questions yet.</p>}
      <ol>
        {sorted.map((q) => (
          <li key={q._id}>
            {q.text} ({q.votes} votes)
          </li>
        ))}
      </ol>
    </div>
  );
}