import { Route, Routes } from "react-router";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LandingPage } from "@/pages/landing-page";
import { EventPage } from "@/pages/event-page";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events/:eventId" element={<EventPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
