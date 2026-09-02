import { GameScreen } from "@/components/game/GameScreen";

export const dynamic = "force-dynamic";

export default async function GamePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <GameScreen sessionId={sessionId} />;
}
