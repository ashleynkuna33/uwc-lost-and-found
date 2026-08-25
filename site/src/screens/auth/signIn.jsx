import { FaKey } from "react-icons/fa";
import { FaUserGraduate } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";

import CustomTextInput from "../../components/CustomTextField";

import { useState } from "react";

function SignIn({setView}) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSignIn = () => {
        alert(`Username: ${username}\nPassword: ${password}`);
        // console.log(password);
        // if (!username.trim() || !password.trim()) {
        //     console.log("Username or Password empty");
        //     return;
        // }

        // console.log("Hello, I am working")
    }

    return(
        <div className="flex justify-center">

            {/* board */}
            <div className="border bg-[#eaf1f7] py-6 px-12 rounded-xl flex flex-col gap-2">

                <h1 className="font-semibold mb-2.5 flex justify-center">Sign in to access student and admin features.</h1>

                <CustomTextInput label="UWC STUDENT/STAFF ID" value={username} onChange={(e) => setUsername(e.target.value)}/>
                <CustomTextInput label="Password" icon={FaLock} type="password" onChange={(e) => setPassword(e.target.value)}/>
                
                <button className="flex w-fit justify-start font-semibold underline cursor-pointer mb-4" onClick={() => setView("ForgotPassword")}>Forgot Password?</button>
                <button type="button" className="bg-[#cead5e] p-2 font-bold text-blue-950 rounded-xl transition-all duration-100 hover:scale-103 hover:bg-[#816c38]" onClick={handleSignIn}>SIGN IN</button>

                <div className="grid grid-cols-2 mt-4 gap-4">
                    <button className="flex flex-row items-center py-3 px-1.5 rounded-xl bg-[#cead5e] cursor-pointer gap-2 transition-all duration-100 hover:scale-103 hover:bg-[#816c38]" onClick={() => window.location.href = "https://student.uwc.ac.za/"}>
                       <FaUserGraduate size={22} color="#162456"/>
                       <h1 className="text-sm font-bold text-blue-950">Log in with Student Portal</h1> 
                    </button>
                    <button onClick={() => setView("AdminAuth")} className="flex flex-row items-center py-3 px-1.5 rounded-xl bg-[#cead5e] cursor-pointer gap-2 transition-all duration-100 hover:scale-103 hover:bg-[#816c38]">
                        <FaKey size={22} color="#162456"/>
                        <h1 className="text-sm font-bold text-blue-950">Admin Access</h1>
                    </button>

                </div>
            </div>

        </div>
    )
}

export default SignIn;