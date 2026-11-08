import type { Metadata } from "next";
import { RoomList } from "@/rooms/RoomList";

export const metadata: Metadata = { title: "내 방 - gagufit" };

export default function RoomsPage() {
  return <RoomList />;
}
