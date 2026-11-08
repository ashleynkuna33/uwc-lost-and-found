import { useState } from "react";
import { MdOutlineSecurity } from "react-icons/md";
import { FaUserCog } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

import CustomTextInput from "../../components/CustomTextField";

function AdminAuth({ login, setView }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError("UWC ID and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(
        { studentNumber: username.trim(), password },
        { requiredRole: "ADMIN" }
      );
    } catch (loginError) {
      setError(
        loginError.response?.data?.message ||
          (typeof loginError.response?.data === "string"
            ? loginError.response.data
            : null) ||
          loginError.message ||
          "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center bg-[#152862] px-4 py-8">
      <div className="mx-auto w-full max-w-3xl rounded-xl border bg-[#eaf1f7] px-6 py-8 sm:px-12">
        <h1 className="text-xl font-semibold">LET&apos;S MAKE UWC SAFE TOGETHER</h1>
        <p className="mt-2 text-sm font-semibold">
          Authorized personnel only
        </p>
        <p className="mt-6 text-lg font-light">
          By continuing on this site you accept the responsibilities listed in
          the{" "}
          <a
            href="https://uwc-za.b-cdn.net/files/files/ICT-Information-Security-policy-ver-C2021-03.pdf"
            className="cursor-pointer font-semibold underline"
            target="_blank"
            rel="noreferrer"
          >
            security policies
          </a>
          .
        </p>

        <MdOutlineSecurity className="my-8" size={48} color="#7c8883" />

        <form
          onSubmit={handleLogin}
          className="grid grid-cols-1 items-center gap-4 md:grid-cols-5"
        >
          <div className="md:col-span-2">
            <CustomTextInput
              label="UWC ID"
              icon={FaUserCog}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="md:col-span-2">
            <CustomTextInput
              icon={RiLockPasswordFill}
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-10.5 rounded-xl bg-[#00a63e] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#008f35] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => setView("SignIn")}
          className="mt-6 text-sm font-semibold text-[#152862] underline"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}

export default AdminAuth;