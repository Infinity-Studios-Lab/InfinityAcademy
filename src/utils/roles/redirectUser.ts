import { jwtDecode } from "jwt-decode";
import { createClient } from "../supabase/server";
import { redirect } from "next/navigation";

async function redirectUser(roles: string[]) {
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (accessToken) {
        const jwt = jwtDecode(accessToken) as any;
        const userRole = jwt.user_role;

        if (!userRole) {
            console.log("User role not found, redirecting to login");
            redirect("/login?message=Please login to access this page");
            return;
        }

        if (!roles.includes(userRole)) {
            if (userRole === "student") {
                redirect("/student");
            } else if (userRole === "parent") {
                redirect("/parent");
            } else if (userRole === "tutor") {
                redirect("/tutor");
            }
        }
    }
}

export default redirectUser;