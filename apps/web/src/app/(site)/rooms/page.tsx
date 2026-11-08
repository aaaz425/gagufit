import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomList } from "@/rooms/RoomList";

export const metadata: Metadata = {
  title: "내 방",
  description: "만든 방을 모아 보고 이어서 편집해요",
};

export default function RoomsPage() {
  return (
    <Suspense>
      <RoomList />
    </Suspense>
  );
}
