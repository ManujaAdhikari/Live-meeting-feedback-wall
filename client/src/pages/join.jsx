import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { socket, clientId} from "../socket";
import { API } from "../config";


export default function Join() {
  const { code } = useParams();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    // 1. load existing questions once
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

    // 2. join the live room
    socket.emit("join-session", code);

    // 3. listen for live changes
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

  function sendQuestion() {
    if (!text.trim()) return;
    socket.emit("question:new", { code, text });
    setText("");
  }

  function upvote(id) {
    socket.emit("question:upvote", { code, id, clientId});
  }
  const sorted = [...questions]
    .filter((q) => q.status !== "hidden")
    .sort((a, b) => (a.status === "answered") - (b.status === "answered") || b.votes - a.votes);
  
  return (
    <div>
      <h1>{title}</h1>
      <p>Session code: {code}</p>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your question"
        maxlength={200}
      />
      <button onClick={sendQuestion}>Send</button>

      <ul>
        {sorted.map((q) => (
          <li key={q._id}>
           {q.status === "answered" && "[Answered] "} 
            {q.text} ({q.votes} votes){" "}
            <button onClick={() => upvote(q._id)}disabled={q.voters?.includes(clientId)}>
              {q.voters?.includes(clientId) ? "Voted" : "Upvote"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}