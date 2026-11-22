import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Host from "./pages/host";
import Join from "./pages/join";

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