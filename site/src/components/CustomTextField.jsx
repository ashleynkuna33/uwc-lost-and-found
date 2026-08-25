import { useState } from "react";
import { FaUser } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";

export default function CustomTextInput({
  icon: Icon = FaUser,
  label,
  type = "text",
  value,
  onChange,
  name,
  required = false,
  className = "",
  ...props
}) {
  const [view, setView] = useState(false);
  const inputType = type === "password" ? (view ? "text" : "password") : type;

  return (
    <div className={`flex flex-row items-center justify-between border-gray-400 border p-2.5 my-0.5 bg-white rounded-xl gap-2 focus-within:border-[#cead5e] transition-colors ${className}`}>
      {/* Icon + Input container */}
      <div className="flex flex-row items-center gap-2 flex-1">
        {Icon && <Icon className="text-gray-500 shrink-0" />}
        <input 
          type={inputType} 
          placeholder={label}
          value={value}
          onChange={onChange}
          name={name}
          required={required}
          className="w-full border-none outline-none bg-transparent text-gray-800 placeholder-gray-400"
          {...props}
        />
      </div>

      {/* Password toggle button */}
      {type === "password" && (
        <button 
          type="button" 
          onClick={() => setView((prev) => !prev)}
          className="cursor-pointer text-gray-500 hover:text-gray-700 shrink-0"
        >
          {view ? <IoEyeOff size={22} /> : <IoEye size={22} />}
        </button>
      )}
    </div>
  );
}