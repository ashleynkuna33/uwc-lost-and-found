import { FiUser } from "react-icons/fi";
import { CiLogout } from "react-icons/ci";

function Claim() {
    return(
        <div className="flex-1 flex flex-col h-full min-h-0 p-4 overflow-y-auto bg-[#eaf1f7]">

            {/* user section */}
            <div className="flex justify-end items-center p-2 gap-2">
                <div className="flex items-center gap-2 bg-[#152862]/10 px-3 py-1 rounded-full font-semibold text-[#152862]">
                    <FiUser className="text-[#cead5e]" size={22} />
                    <span>Logged in as: <strong className="text-black">4429119</strong></span>
                </div>
                <CiLogout size={26} color="#f14c53" className="cursor-pointer"/>
            </div>

        </div>
    )
}

export default Claim;