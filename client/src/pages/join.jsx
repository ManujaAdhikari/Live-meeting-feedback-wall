import { useParams } from "react-router-dom";

export default function Join() {
  const { code } = useParams();
  return <h1>Join session {code}</h1>;
}