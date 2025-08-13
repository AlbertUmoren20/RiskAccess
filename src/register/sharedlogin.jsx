// src/utils/login.js
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import React from "react";

const supabase = createClient(
  "https://oelqunglsskvxczyxdgp.supabase.co",
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbHF1bmdsc3Nrdnhjenl4ZGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MzA0NzQsImV4cCI6MjA2NjIwNjQ3NH0.x1xtaWa3Oa4dTozmLsjqe0uz-FtqfjgWhhPei_AosSE"
);

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

