import { createClient } from "../../utils/supabase/server";
import { cookies } from "next/headers";

export default async function StudentHome() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from("todos").select();

  return (
    <div className="text-sm">
      Welcome to the student dashboard.
      <div className="text-sm">
        <ul>
          {todos?.map((todo, index) => (
            <li key={todo.id || index}>{todo.name || todo}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
