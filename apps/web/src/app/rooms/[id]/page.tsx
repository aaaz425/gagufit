import type { Metadata } from "next";
import { Editor } from "@/editor/Editor";

export const metadata: Metadata = { title: "편집기 - gagufit" };

export default async function RoomPage({ params }: PageProps<"/rooms/[id]">) {
  const { id } = await params;
  return <Editor key={id} roomId={id} />;
}
