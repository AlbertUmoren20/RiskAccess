// pages/update-password.js
import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


export default function UpdatePasswordPage() {
    const supabase = useSupabaseClient();
    const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) {
            console.error("Error setting session:", error);
            alert("Invalid or expired reset link");
          } else {
            setSessionReady(true);
          }
        });
    } else {
      alert("Reset link is missing required tokens.");
    }
  }, []);

  const handleUpdatePassword = async () => {
    if (!password) return alert("Please enter a new password");
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully! You can now log in.");
      navigate("/login"); // Or role-specific login if you want
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Update Your Password</h1>
      <input
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border px-3 py-2 rounded w-full mb-4"
      />
      <button
        onClick={handleUpdatePassword}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
}
