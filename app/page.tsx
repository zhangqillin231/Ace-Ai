import { redirect } from "next/navigation";

export default function Home() {
  // Redirect users from `/` → `/assistant/chat`
  redirect("/assistant/chat");
}
