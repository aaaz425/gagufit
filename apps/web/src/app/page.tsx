import { redirect } from "next/navigation";

// 랜딩 전까지 목록으로
export default function Home() {
  redirect("/rooms");
}
