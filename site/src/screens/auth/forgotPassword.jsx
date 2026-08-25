import { useState } from "react";
import CustomTextInput from "../../components/CustomTextField";

import { MdOutlineNumbers } from "react-icons/md";

function ForgotPassword({setView}) {

    const [username, setUsername] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSend] = useState(false);

    const handleSendOtp = () => {
        if (!username.trim()) return;

        setIsOtpSend(true);

    };


    return(
        <div className="flex justify-center">
            <div className="border bg-[#eaf1f7] py-6 px-12 rounded-xl flex flex-col gap-2">

                <h1 className="font-semibold mb-4.5 flex justify-center text-xl">Forgot Password</h1>

                <div className="flex flex-row gap-6">
                    <CustomTextInput label="UWC STUDENT/STAFF ID OR EMAIL" value={username} onChange={(e) => setUsername(e.target.value)}/>
                    <button onClick={handleSendOtp} type="button" disabled={!username.trim()} className="px-1.5 rounded-2xl text-sm font-bold text-white bg-green-500 cursor-pointer transition-all duration-100 hover:bg-green-600">
                        {isOtpSent ? "RESEND CODE" : "SEND CODE"}
                    </button>
                </div>

                <button className="w-fit font-semibold underline flex justify-start my-2 cursor-pointer" onClick={() => setView("SignIn")}>Already have an account? Login</button>

                <CustomTextInput icon={MdOutlineNumbers} label={"VERIFY OTP CODE"} type="numeric" disabled={!isOtpSent}/>

                <button className="border mt-8 p-2 text-sm font-bold text-white rounded-xl bg-[#152862] cursor-pointer transition-all duration-100 hover:scale-103" disabled={!isOtpSent || !otp.trim()}>CONTINUE</button>

            </div>
        </div>
    )
}

export default ForgotPassword;