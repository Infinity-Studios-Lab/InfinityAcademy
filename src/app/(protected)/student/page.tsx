import redirectUser from "@/utils/roles/redirectUser";
import { createClient } from "../../../utils/supabase/server";
import { jwtDecode } from "jwt-decode";

export default async function StudentHome() {
  await redirectUser(["student"]);
  
  return (
    <div className="text-sm">
      Welcome to the student dashboard.
      <div className="text-sm">
        <div className="card bg-base-100 shadow">
          <div className="card-body"></div>
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
