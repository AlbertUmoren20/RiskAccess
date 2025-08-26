// src/utils/login.js
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export const useSupabaseLogin = () => {
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError) throw authError;

      // 2. Get team member role from table
      const { data: teamMember, error: roleError } = await supabase
        .from("team_members")
        .select("access")
        .eq("id", authData.user.id)
        .single();

      if (roleError) throw roleError;

      // 3. Redirect based on role
      switch (teamMember.access) {
        case "admin":
          navigate("/admin");
          break;
        case "manager":
          navigate("/manager/dashboard");
          break;
        default:
          navigate("/userHome");
      }
    } catch (err) {
      throw new Error(err.message);
    }
  };

  return { login };
};

