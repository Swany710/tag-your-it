import { redirect } from "next/navigation";

export default function HomePage() {
  // Root should always land in the admin experience.
  redirect("/admin");
}
