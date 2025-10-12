import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import NavigationBar from "./components/NavigationBar.jsx";
import "./index.css";


const Landing       = lazy(() => import("./pages/Landing.jsx"));
const Search        = lazy(() => import("./pages/Search.jsx"));
const Lessons       = lazy(() => import("./pages/Lessons.jsx"));
const Boarding      = lazy(() => import("./pages/Boarding.jsx"));
const StableProfile = lazy(() => import("./pages/StableProfile.jsx"));
const UserProfile   = lazy(() => import("./pages/UserProfile.jsx"));
const UserSignUp    = lazy(() => import("./pages/UserSignUp.jsx"));
const StableSignUp  = lazy(() => import("./pages/StableSignUp.jsx"));

function Fallback() {
  return (
    <div className="container">
      <div className="skeleton" style={{height: 24, width: 160, marginBottom: 12}} />
      <div className="skeleton" style={{height: 16, width: "100%"}} />
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <NavigationBar />
      <main className="main">
        <div className="container">
          <Suspense fallback={<Fallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/search" element={<Search />} />
              <Route path="/lessons" element={<Lessons />} />
              <Route path="/boarding" element={<Boarding />} />
              <Route path="/stables/:id" element={<StableProfile />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/userSignUp" element={<UserSignUp/>} />
              <Route path="/stableSignUp" element={<StableSignUp/>} />
              <Route path="*" element={<div>Not found</div>} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
