import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Host from "./pages/Host";
import Join from "./pages/Join";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/host/:code" element={<Host />} />
        <Route path="/join/:code" element={<Join />} />
      </Routes>
    </BrowserRouter>
  );
}