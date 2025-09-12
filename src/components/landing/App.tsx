import Blob from "./components/Blob";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import MainPage from "./components/pages/MainPage";
import { Routes, Route, useLocation } from "react-router-dom";
import CompletedPage from "./components/pages/CompletedPage";

function App() {
  const [active, setActive] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkScroll = () => {
      const s12 = document.getElementById("faq");
      const s13 = document.getElementById("contact");

      if (!s12 || !s13) {
        setActive(true);
        return;
      }

      const scrollY = window.scrollY + window.innerHeight / 2;
      const s12Start = s12.offsetTop;
      const s13End = s13.offsetTop + s13.offsetHeight;

      // Hide blob if scrolled into Section_12 or Section_13
      setActive(!(scrollY >= s12Start && scrollY <= s13End));
    };

    checkScroll();
    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  useEffect(() => {
    const sectionId = location.pathname.slice(1);
    if (sectionId && sectionId !== "") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <Routes>
      <Route path="/completed" element={<CompletedPage />} />
      <Route
        path="*"
        element={
          <main className="relative mx-auto flex flex-col items-center">
            <Blob active={active} />
            <Header />
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/home" element={<MainPage />} />
              <Route path="/video" element={<MainPage />} />
              <Route path="/scenario" element={<MainPage />} />
              <Route path="/pricing" element={<MainPage />} />
              <Route path="/review" element={<MainPage />} />
              <Route path="/faq" element={<MainPage />} />
              <Route path="/contact" element={<MainPage />} />
              <Route path="/report" element={<MainPage />} />
            </Routes>
            <Footer />
          </main>
        }
      />
    </Routes>
  );
}

export default App;
