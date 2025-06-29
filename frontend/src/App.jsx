import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import Profile from "./components/Profile";
import { AuthProvider } from "./components/AuthContext";
import AboutUs from "./components/AboutUs";
import MovieDetail from "./components/MovieDetail";
import UserProfile from "./components/UserProfile";
import Recommended from "./components/Recommended";
import Follower from "./components/Followers";
import NotFound from "./components/NotFound";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-[#101624]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/user-movies" element={<Profile />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/movies/:id" element={<MovieDetail />} />
              <Route path="/user-profile" element={<UserProfile />} />
              <Route path="/recommended" element={<Recommended />} />
              <Route path="/profile/:username" element={<Follower />} />
              <Route path="*" element={<NotFound />} />   
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
