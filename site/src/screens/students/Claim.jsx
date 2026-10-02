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

             {/* body section */}

                          
         <div className="flex flex-col md:flex-row gap-4 ml-35 mt-7 mb-4">
                    {/* main Container. */}

                <div className="max-w-[400px] rounded-xl border border-gray-200 bg-white p-100 shadow-lg  ">
                      {/* the main content */}

                      <div className="bg-grey">
                         <p>
                            
                         </p>
                      </div>
                </div>



                <div>
                      {/* small containers on the side  */}
                      <div className="max-w-md rounded-xl border border-gray-200 bg-white p-35 shadow-md mb-4">
                        
                      </div>
                      <div className="max-w-md rounded-xl border border-gray-200 bg-white p-35 shadow-md mb-4">

                      </div>
                      <div className="max-w-md rounded-xl border border-gray-200 bg-white p-35 shadow-md mb-4">

                      </div>
                      <div className="max-w-md rounded-xl border border-gray-200 bg-white p-35 shadow-md">

                      </div>

                </div>


                    
          </div>

        </div>
    )
}

export default Claim;