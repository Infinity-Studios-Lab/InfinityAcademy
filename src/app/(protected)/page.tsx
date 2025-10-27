import redirectUser from "@/utils/roles/redirectUser";
import { redirect } from "next/navigation";

export default async function ProtectedHome() {
  await redirectUser([]);
}
