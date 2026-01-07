import { jwtDecode } from "jwt-decode";
import { createClient } from "../supabase/server";
import { redirect } from "next/navigation";

async function redirectUser(roles: string[]) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        console.log("User not authenticated, redirecting to login");
        redirect("/login?message=Please login to access this page");
        return;
    }

    console.log("User authenticated:", user.id, user.email);
    console.log("User metadata:", JSON.stringify(user.user_metadata, null, 2));
    console.log("Raw user meta data:", JSON.stringify(user.raw_user_meta_data, null, 2));

    // Get user role from users table instead of JWT
    // First try to get role from user metadata as fallback
    const roleFromMetadata = user.user_metadata?.role || user.raw_user_meta_data?.role;
    console.log("Role from metadata:", roleFromMetadata);
    
    const { data: userRecord, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
    
    console.log("Database query result:", { userRecord, error });

    // If query fails due to RLS, use metadata role as fallback
    if (error) {
        console.error("Error fetching user record:", error);
        console.error("Error code:", error.code);
        
        // If we have role in metadata, use it temporarily
        if (roleFromMetadata) {
            console.log("Using role from metadata due to RLS issue:", roleFromMetadata);
            const userRole = roleFromMetadata as string;
            // If no specific roles required, or user's role is allowed, proceed
            if (roles.length === 0 || roles.includes(userRole)) {
                console.log("Role check passed, allowing access");
                return; // Allow access
            }
            // Redirect based on role if not allowed
            console.log("Redirecting based on role:", userRole);
            if (userRole === "student") redirect("/student");
            else if (userRole === "parent") redirect("/parent");
            else if (userRole === "tutor") redirect("/tutor");
            else if (userRole === "admin") redirect("/admin");
            else redirect("/login?message=Invalid user role");
            return;
        }
        
        // Try to create user record
        const defaultRole = roleFromMetadata || 'student';
        const { error: insertError } = await supabase
            .from("users")
            .insert([{
                id: user.id,
                email: user.email!,
                role: defaultRole,
                profile_data: {},
            }])
            .select("role")
            .maybeSingle();
        
        if (insertError) {
            console.error("Error creating user record:", insertError);
            // If RLS blocks both, use metadata role
            if (roleFromMetadata) {
                console.log("Using metadata role due to insert error:", roleFromMetadata);
                const userRole = roleFromMetadata as string;
                if (roles.length === 0 || roles.includes(userRole)) {
                    // Allow access, don't redirect
                    return;
                }
                // Redirect based on role
                if (userRole === "student") redirect("/student");
                else if (userRole === "parent") redirect("/parent");
                else if (userRole === "tutor") redirect("/tutor");
                else if (userRole === "admin") redirect("/admin");
                return;
            }
            redirect("/login?message=Please run the SQL fix in docs/FIX_RLS_LOGIN_ISSUE.sql");
            return;
        }
        
        // Retry after insert
        const { data: retryRecord } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
        
        if (retryRecord?.role) {
            const userRole = retryRecord.role;
            if (roles.length > 0 && !roles.includes(userRole)) {
                if (userRole === "student") redirect("/student");
                else if (userRole === "parent") redirect("/parent");
                else if (userRole === "tutor") redirect("/tutor");
                else if (userRole === "admin") redirect("/admin");
            }
            return;
        }
        
        // Final fallback to metadata
        if (roleFromMetadata) {
            const userRole = roleFromMetadata as string;
            if (roles.length > 0 && !roles.includes(userRole)) {
                if (userRole === "student") redirect("/student");
                else if (userRole === "parent") redirect("/parent");
                else if (userRole === "tutor") redirect("/tutor");
                else if (userRole === "admin") redirect("/admin");
            }
            return;
        }
        
        redirect("/login?message=Please run the SQL fix in docs/FIX_RLS_LOGIN_ISSUE.sql");
        return;
    }

    if (!userRecord || !userRecord.role) {
        // Try to create it or use metadata
        const defaultRole = roleFromMetadata || 'student';
        const { error: insertError } = await supabase
            .from("users")
            .insert([{
                id: user.id,
                email: user.email!,
                role: defaultRole,
                profile_data: {},
            }])
            .select("role")
            .maybeSingle();
        
        if (!insertError) {
            const retryRecord = await supabase
                .from("users")
                .select("role")
                .eq("id", user.id)
                .maybeSingle();
            
            if (retryRecord.data?.role) {
                const userRole = retryRecord.data.role;
                if (roles.length > 0 && !roles.includes(userRole)) {
                    if (userRole === "student") redirect("/student");
                    else if (userRole === "parent") redirect("/parent");
                    else if (userRole === "tutor") redirect("/tutor");
                    else if (userRole === "admin") redirect("/admin");
                }
                return;
            }
        }
        
        // Use metadata role as fallback
        if (roleFromMetadata) {
            const userRole = roleFromMetadata as string;
            if (roles.length > 0 && !roles.includes(userRole)) {
                if (userRole === "student") redirect("/student");
                else if (userRole === "parent") redirect("/parent");
                else if (userRole === "tutor") redirect("/tutor");
                else if (userRole === "admin") redirect("/admin");
            }
            return;
        }
        
        redirect("/login?message=Please complete your account setup");
        return;
    }

    const userRole = userRecord.role;
    console.log("User role from database:", userRole);

    if (!userRole) {
        console.log("User role not found in database, trying metadata");
        // Try metadata as fallback
        if (roleFromMetadata) {
            const metaRole = roleFromMetadata as string;
            console.log("Using metadata role:", metaRole);
            if (roles.length === 0 || roles.includes(metaRole)) {
                return; // Allow access
            }
            if (metaRole === "student") redirect("/student");
            else if (metaRole === "parent") redirect("/parent");
            else if (metaRole === "tutor") redirect("/tutor");
            else if (metaRole === "admin") redirect("/admin");
            return;
        }
        console.log("No role found anywhere, redirecting to login");
        redirect("/login?message=Please complete your account setup");
        return;
    }

    // If specific roles required, check if user's role is allowed
    if (roles.length > 0 && !roles.includes(userRole)) {
        console.log("User role not in allowed roles, redirecting:", userRole, "not in", roles);
        // Redirect to appropriate dashboard based on role
        if (userRole === "student") {
            redirect("/student");
        } else if (userRole === "parent") {
            redirect("/parent");
        } else if (userRole === "tutor") {
            redirect("/tutor");
        } else if (userRole === "admin") {
            redirect("/admin");
        } else {
            redirect("/login?message=Invalid user role");
        }
        return;
    }
    
    // If no roles specified (empty array), redirect to user's dashboard
    if (roles.length === 0) {
        console.log("No roles specified, redirecting to user's dashboard:", userRole);
        if (userRole === "student") {
            redirect("/student");
        } else if (userRole === "parent") {
            redirect("/parent");
        } else if (userRole === "tutor") {
            redirect("/tutor");
        } else if (userRole === "admin") {
            redirect("/admin");
        } else {
            redirect("/student"); // Default fallback
        }
        return;
    }
    
    console.log("Role check passed, allowing access");
    // If we get here, user's role is allowed
    return;
}

export default redirectUser;