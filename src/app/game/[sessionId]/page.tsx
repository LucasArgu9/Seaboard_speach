import { GameScreen } from "@/components/game/GameScreen";
import { KioskGate } from "@/components/game/KioskGate";

export const dynamic = "force-dynamic";

export default async function GamePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <KioskGate>
      <GameScreen sessionId={sessionId} />
    </KioskGate>
  );
}
