import ItemsContainer from "../../components/ItemsContainer";

function FindItems() {
    return(
        <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto bg-[#eaf1f7]">
            <div className="flex justify-center p-6 bg-[#152862] border-b-4 border-[#cead5e] shadow-md">
                <h1 className="font-bold text-white text-2xl tracking-wide">BROWSE LOST AND STOLEN PROPERTY</h1>
            </div>

            <ItemsContainer />

            

        </div>
    )
}

export default FindItems;