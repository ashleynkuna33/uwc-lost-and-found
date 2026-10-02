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

                <div className="max-w-[800px] rounded-xl border border-gray-200 bg-white p-6 shadow-lg  ">
                      {/* the main content */}

                      <div className="">
                         <p className="break-words bg-gray-200 p-3 rounded-md">

                            jhadgadsjkdgsafafsadljkahfgw;sdqwiowsajdlafhsjadfvjsasjdfdsvsdouawgedhbw;oqffhdfwequr9tr 
                            83urkdsjfbmxcnlasfgefqlr3q9pweopwoeiriajkghjdsgfsdusioeuwoefdndsjds
                         </p>
                      </div>

                      <div>
                        <form>

                            <div className="mt-4 flex flex-row gap-4">
                                <div className="flex flex-col gap-2 ">
                                    <label htmlFor="lost-date">When did you lose it?</label>
                                    <input
                                    id="lost-date"
                                    type="text"
                                    placeholder="dd-mm-yyyy"
                                    className="rounded-lg border border-gray-300 p-2 min-w-[350px]"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 ml-1">
                                    <label htmlFor="lost-location">Where did you lose it?</label>
                                    <input
                                    id="lost-location"
                                    type="text"
                                    placeholder="Location e.g. Library"
                                    className="rounded-lg border border-gray-300 p-2 min-w-[350px]"
                                    />
                                </div>
                         </div>
                          
                        </form>
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