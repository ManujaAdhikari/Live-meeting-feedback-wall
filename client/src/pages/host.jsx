import { useParams } from "react-router-dom";

export default function Host() {
  const { code } = useParams();
  return <h1>Host dashboard for {code}</h1>;
}