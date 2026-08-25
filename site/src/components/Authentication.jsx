import { useState } from "react";
import { SignIn, ForgotPassword, AdminAuth } from "../screens/auth";
import { DiJava } from "react-icons/di";

function Authentication() {
    const [screen, setScreen] = useState("SignIn");

    return (
        <div className="flex-1 flex flex-col bg-[#152862]">

            {/* header */}
            <div className="flex justify-center px-1">
                <h1 className="text-4xl font-semibold text-[#cead5e] py-6">UWC SYSTEM AUTHENTICATION</h1>
            </div>

            {screen === "SignIn" && <SignIn setView={setScreen}/>}
            {screen === "ForgotPassword" && <ForgotPassword setView={setScreen}/>}
            {screen === "AdminAuth" && <AdminAuth setView={setScreen}/>}

            {/* footer */}
            <div className="mt-auto flex justify-center mb-4">
                <h1 className="text-gray-400">System designed for UWC Students by Students. Need access? <a className="underline cursor-pointer" href="https://www.uwc.ac.za/study/academic-administration/student-administration-helpdesk">Contact IT Helpdesk</a></h1>
            </div>

        </div>
    );
}

export default Authentication;