import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tenant, setTenant] = useState(null); // <-- ADD THIS
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setTenant(null); // <-- ADD THIS
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    setProfile(profileData);

    // <-- ADD THIS BLOCK: Fetch tenant details
    if (profileData?.tenant_id) {
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", profileData.tenant_id)
        .single();
      setTenant(tenantData);
    }

    setLoading(false);
  }

  function updateTenant(newTenantData) {
    setTenant((prev) => (prev ? { ...prev, ...newTenantData } : null));
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        tenant,
        tenantId: profile?.tenant_id,
        role: profile?.role,
        loading,
        signOut,
        updateTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
