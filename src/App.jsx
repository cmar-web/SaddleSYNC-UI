import { Suspense, lazy, Component } from "react";
import { Routes, Route } from "react-router-dom";
import NavigationBar from "./components/NavigationBar.jsx";
import Footer from "./components/Footer.jsx";
import "./index.css";


const Landing       = lazy(() => import("./pages/Landing.jsx"));
const Search        = lazy(() => import("./pages/Search.jsx"));
const Lessons       = lazy(() => import("./pages/Lessons.jsx"));
const Boarding      = lazy(() => import("./pages/Boarding.jsx"));
const BoardingInfo  = lazy(() => import("./pages/BoardingInfo.jsx"));
const StableProfile = lazy(() => import("./pages/StableProfile.jsx"));
const StableHorses  = lazy(() => import("./pages/StableHorses.jsx"));
const HorseDetail   = lazy(() => import("./pages/HorseDetail.jsx"));
const UserProfile   = lazy(() => import("./pages/UserProfile.jsx"));
const UserSignUp    = lazy(() => import("./pages/UserSignUp.jsx"));
const StableSignUp  = lazy(() => import("./pages/StableSignUp.jsx"));
const Login         = lazy(() => import("./pages/UserLogin.jsx"));
const CreateHorse   = lazy(() => import("./pages/CreateHorse.jsx"));
const Payment       = lazy(() => import("./pages/Payment.jsx"));
const ServicesUpcoming = lazy(() => import("./pages/ServicesUpcoming.jsx"));
const ServicesHistory  = lazy(() => import("./pages/ServicesHistory.jsx"));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Something went wrong." };
  }
  componentDidCatch(error, info) {
    console.error("UI error:", error, info);
  }
  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-10">
          <div className="rounded-2xl border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))] px-6 py-4 space-y-3">
            <div className="text-lg font-semibold">Something went wrong</div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">{this.state.message}</div>
            <button
              className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              onClick={this.handleReset}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


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
          <ErrorBoundary>
            <Suspense fallback={<Fallback />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/search" element={<Search />} />
                <Route path="/lessons" element={<Lessons />} />
                <Route path="/boarding" element={<Boarding />} />
                <Route path="/stables/:id" element={<StableProfile />} />
                <Route path="/stables/:stableId/horses/new" element={<CreateHorse />} />
                <Route path="/stables/:id/horses" element={<StableHorses />} />
                <Route path="/stables/:stableId/horses/:horseId" element={<HorseDetail />} />
                <Route path="/users/:userId/horses/:horseId" element={<HorseDetail />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/userSignUp" element={<UserSignUp/>} />
                <Route path="/stableSignUp" element={<StableSignUp/>} />
                <Route path="/login" element={<Login/>}/>
                <Route path="/createHorse" element={<CreateHorse/>}/>
                <Route path="/boardingInfo" element={<BoardingInfo/>}/>
                <Route path="/services/upcoming" element={<ServicesUpcoming/>}/>
                <Route path="/services/history" element={<ServicesHistory/>}/>
                <Route path="/payment" element={<Payment/>}/>
                <Route path="*" element={<div>Not found</div>} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
      <Footer />
    </div>
  );
}
