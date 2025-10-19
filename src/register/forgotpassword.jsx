import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function ForgotPassword({ email }) {
    const supabase = useSupabaseClient();
  const [resetEmail, setResetEmail] = useState(email || "");
  const [loading, setLoading] = useState(false);
  const error = (message) => alert(message);
  const success = (message) => alert(message);

  const handleReset = async () => {
    if (!resetEmail) {
      error("Please enter your email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/update-password`
    });
    setLoading(false);

    if (error) error(error.message);
    else success("Password reset link sent to your email");
  };

  return (
    <div className="mt-3">
      <input
        type="email"
        placeholder="Enter your email"
        value={resetEmail}
        onChange={(e) => setResetEmail(e.target.value)}
        className="border px-3 py-2 rounded w-full"
      />
      <button
        onClick={handleReset}
        disabled={loading}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Sending..." : "Forgot Password?"}
      </button>
    </div>
  );
}

