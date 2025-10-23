import CalendarCard from "@/components/calendarCard";
import { createClient } from "../../../utils/supabase/server";
import { jwtDecode } from "jwt-decode";

export default async function StudentHome() {
  const supabase = await createClient();

  const { data: todos } = await supabase.from("todos").select();

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      const jwt = jwtDecode(session.access_token) as any;
      const userRole = jwt.user_role;

      console.log(jwt);
      console.log("userRole", userRole);
    }
  });

  return (
    <div className="text-sm">
      Welcome to the student dashboard.
      <div className="text-sm">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <CalendarCard date={"12/12/2025"} time={"12:15"} event={"Coding Lesson"} name={"Avar"}></CalendarCard>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
        <ul>
          {todos?.map((todo, index) => (
            <li key={todo.id || index}>{todo.name || todo}</li>
          ))}
        </ul>*/
