import { FiUser } from "react-icons/fi";
import { CiLogout } from "react-icons/ci";

function Claim() {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-y-auto bg-[#eaf1f7] p-4 md:p-6">
      {/* User section */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-2 rounded-full bg-[#152862]/10 px-3 py-2 font-semibold text-[#152862]">
          <FiUser className="text-[#cead5e]" size={22} />
          <span>
            Logged in as: <strong className="text-black">4429119</strong>
          </span>
        </div>

        <CiLogout
          size={26}
          color="#f14c53"
          className="cursor-pointer"
        />
      </div>

      {/* Body section */}
      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
        {/* Main card */}
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-lg md:p-6 lg:col-span-3">
         

          <form className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="lost-date" className="mb-2">
                  When did you lose it?
                </label>
                <input
                  id="lost-date"
                  name="lostDate"
                  type="date"
                  className="box-border w-full min-w-0 rounded-lg border border-gray-300 p-2"
                />
              </div>

              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="lost-location" className="mb-2">
                  Where did you lose it?
                </label>
                <input
                  id="lost-location"
                  name="lostLocation"
                  type="search"
                  placeholder="Location e.g. Library"
                  className="box-border w-full min-w-0 rounded-lg border border-gray-300 p-2"
                />
              </div>
            </div>

            <div>
            <label htmlFor="lost-description" >
              Attachments:
            </label>
                    <input
                    id="lost-description"
                    name="lostDescription"
                    type="file"
                    className="box-border w-full min-w-0 rounded-lg border border-gray-300 p-2 mt-2"
                    ></input>

            </div>

            <div>

            <label htmlFor="lost-description" className="mb-2">
              Description:
            </label>
                        <p className="text-sm text-gray-500 [overflow-wrap:anywhere]">
                            Please provide a detailed description of the lost item, including any distinguishing features or identifying marks. This will help us in locating and returning your item to you.
                        </p>
                        <textarea
                        id="lost-description"
                        name="lostDescription"
                        placeholder="Provide a detailed description of the lost item."
                        className="box-border w-full min-w-0 rounded-lg border border-gray-300 p-2 h-60"
                        ></textarea>
            </div>

            <div>

                <p className="[overflow-wrap:anywhere]"> How do you want to receive your item?</p>

                <div>
                    <label htmlFor="receive-method" className="mb-2 boarder boarder-black rounded-lg p-2">
                        <input
                        id="receive-method"
                        name="receiveMethod"
                        type="radio"
                        value="pickup"
                        className="mr-2"
                        />
                        Pick up at the office
                    </label>

                </div>

                <div className="boarder boarder-black rounded-lg p-2">
                    <label htmlFor="receive-method" className="mb-2">
                        <input
                        id="receive-method"
                        name="receiveMethod"
                        type="radio"
                        value="courier"
                        className="mr-2"
                        />
                        Arrange a courier to pick up the item
                    </label>

                </div>

                
            </div>


        

          </form>
        </div>

        {/* Side cards */}
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
            <h3 className="font-semibold">Card 1</h3>
            <p className="mt-2 [overflow-wrap:anywhere]">
              Add your information here.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
            <h3 className="font-semibold">Card 2</h3>
            <p className="mt-2 [overflow-wrap:anywhere]">
              Add your information here.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
            <h3 className="font-semibold">Card 3</h3>
            <p className="mt-2 [overflow-wrap:anywhere]">
              Add your information here.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
            <h3 className="font-semibold">Card 4</h3>
            <p className="mt-2 [overflow-wrap:anywhere]">
              Add your information here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Claim;