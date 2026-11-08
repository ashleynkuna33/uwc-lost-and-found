//assets
import HeaderImageLogo from "./assets/uwcHeaderLogo-transparent.png"

// 
import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import Authentication from "./components/Authentication";

import { useAuth } from "./hooks/useAuth";

import { Home, Claim, FindItems, Reports, Help } from "./screens/students";
import AdminClaim from "./screens/administrators/Claim";
import AdminReports from "./screens/administrators/Reports";

// component checked
const MenuBtn = ({ Label, focus, setFocus }) => {
  const isFocused = focus === Label;

  return (
    <button 
      onClick={() => setFocus(Label)}
      className={`text-sm sm:text-md md:text-xl transition-all duration-100 pb-1 cursor-pointer hover:text-[#cead5e]/80 hover:border-b hover:border-b-[#cead5e] ${
        isFocused ? "text-[#cead5e] border-b border-b-[#cead5e] font-normal" : "text-gray-200 font-extralight"
      }`}
    >
      {Label}
    </button>
  )
}

function App() {
  const [focus, setFocus] = useState("Home");
  const { user, status, isAuthenticated, isLoading, checkSession, login, logout } = useAuth();

  const userRoles = [
    user?.role,
    ...(Array.isArray(user?.roles) ? user.roles : []),
  ];
  const isAdmin = userRoles.some(
    (role) => String(role || "").toUpperCase().replace(/^ROLE_/, "") === "ADMIN"
  );

  const handleLogout = async () => {
    await logout();
    setFocus("Home");
  };

  const renderScreen = () => {
    switch (focus) {
      case "Home":
        return <Home setView={setFocus} />;

      case "Reports":
        return isAdmin
          ? <AdminReports />
          : <Reports user={user} logout={logout}/>;

      case "Claim Items":
        return isAdmin
          ? <AdminClaim />
          : <Claim user={user} logout={logout}/>;

      case "Find Items":
        return <FindItems isAdmin={isAdmin} />;

      case "Help":
        return <Help />;

      default:
        return <Home setView={setFocus} />;
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* header - checked and it is working as intended */}
      <div className="flex flex-wrap p-4 bg-[#152862] items-center justify-between border-b-4 border-[#cead5e] gap-4">
        <div className="flex flex-row gap-4 items-center" onClick={() => window.location.reload()}>
          <img src={HeaderImageLogo} alt="" width={200} height={200}/>
          {/* <h1 className="font-thin text-5xl">LOST & FOUND SYSTEM</h1> */}
        </div>
        
        {/* menu options */}
        <div className="flex flex-row flex-wrap items-center gap-6">
          <MenuBtn Label={"Home"} focus={focus} setFocus={setFocus} />
          <MenuBtn Label={"Reports"} focus={focus} setFocus={setFocus} />
          <MenuBtn Label={"Claim Items"} focus={focus} setFocus={setFocus} />
          <MenuBtn Label={"Find Items"} focus={focus} setFocus={setFocus} />
          <MenuBtn Label={"Help"} focus={focus} setFocus={setFocus} />
          {isAuthenticated && isAdmin && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <FiLogOut size={17} />
              Log out
            </button>
          )}
        </div>

      </div>

      {/* body */}
        {isLoading ? (
          <p>Checking session...</p>

        ) : status === "error" ? (
          <div>
            <p>Unable to verify your session.</p>
            <button onClick={checkSession}>
              Retry
            </button>
          </div>

        ) : !isAuthenticated ? (
          <Authentication login={login}/>

        ) : (
          renderScreen()
        )}

    </div>
  )
}

export default App