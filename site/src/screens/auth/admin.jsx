import { MdOutlineSecurity } from "react-icons/md";
import { FaUserCog } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

import CustomTextInput from "../../components/CustomTextField";

function AdminAuth() {
    return(
        <div className="flex-1 flex flex-col bg-[#152862]">
            {/* board */}
            <div className="border bg-[#eaf1f7] py-6 px-12 flex flex-col gap-2">

                <h1 className="font-semibold text-xl">LET'S MAKE UWC SAFE TOGETHER</h1>
                <p className="font-semibold text-sm">Authorized to security personel only</p>

                <p className="mt-6 font-thin text-xl">By continuining on this site you accept to take responsibility listed on <a href="https://uwc-za.b-cdn.net/files/files/ICT-Information-Security-policy-ver-C2021-03.pdf" className="underline font-semibold cursor-pointer">security policies</a></p>

                <div className="mt-12">
                    <MdOutlineSecurity size={48} color="#7c8883"/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 my-4 gap-4 items-center">
                    {/* Username: takes full width on mobile, 2 cols on md+ */}
                    <div className="col-span-1 md:col-span-2">
                        <CustomTextInput label={"Username ID / Email"} icon={FaUserCog} />
                    </div>

                    {/* Password: takes full width on mobile, 2 cols on md+ */}
                    <div className="col-span-1 md:col-span-2">
                        <CustomTextInput icon={RiLockPasswordFill} label={"Password"} type="password" />
                    </div>

                    {/* Button: takes full width on mobile, 1 col on md+ */}
                    <button 
                        type="button" 
                        className="col-span-1 md:col-span-1 h-10.5 px-4 rounded-xl text-sm text-white font-semibold bg-[#00a63e] hover:bg-[#008f35] transition-colors cursor-pointer"
                    >
                        Log In
                    </button>
                </div>

                

            </div>
        </div>
    )
}

export default AdminAuth;