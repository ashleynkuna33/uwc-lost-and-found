//assets
import HeaderImageLogo from "./assets/uwcHeaderLogo-transparent.png"

// 
import { useState } from "react";
import Authentication from "./components/Authentication";

import { Home, Claim, FindItems, Reports, Help } from "./screens/students";

const MenuBtn = ({ Label, focus, setFocus }) => {
  const isFocused = focus === Label;

  return (
    <button 
      onClick={() => setFocus(Label)}
      className={`text-xl transition-all duration-100 pb-1 cursor-pointer hover:text-[#cead5e]/80 hover:border-b hover:border-b-[#cead5e] ${
        isFocused ? "text-[#cead5e] border-b border-b-[#cead5e] font-normal" : "text-gray-200 font-extralight"
      }`}
    >
      {Label}
    </button>
  )
}

function App() {

  const [focus, setFocus] = useState("Home");

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* header */}
      <div className="flex flex-wrap p-4 bg-[#152862] items-center justify-between border-b-4 border-[#cead5e] gap-4">
        <div className="flex flex-row gap-4 items-center" onClick={() => window.location.reload()}>
          <img src={HeaderImageLogo} alt="" width={200} height={200}/>
          {/* <h1 className="font-thin text-5xl">LOST & FOUND SYSTEM</h1> */}
        </div>
        
        {/* menu options */}
        <div className="flex flex-row items-center gap-6">
          <MenuBtn Label={"Home"} focus={focus} setFocus={setFocus} />
          <MenuBtn Label={"My Reports"} focus={focus} setFocus={setFocus} />
          <MenuBtn Label={"Claim Items"} focus={focus} setFocus={setFocus} />
          <MenuBtn Label={"Find Items"} focus={focus} setFocus={setFocus} />
          <MenuBtn Label={"Help"} focus={focus} setFocus={setFocus} />
        </div>

      </div>

      {/* body */}
      {/* <Authentication /> */}
      { focus === "Home" && <Home setView={setFocus}/>}
      { focus === "My Reports" && <Reports />}
      { focus === "Claim Items" && <Claim />}
      { focus === "Find Items" && <FindItems />}
      { focus === "Help" && <Help />}

    </div>
  )
}

export default App