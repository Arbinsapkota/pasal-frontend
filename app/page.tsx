import { redirect } from "next/navigation";

export default function Page() {
  redirect("./homepage");

  return <div>hello world</div>;
}
