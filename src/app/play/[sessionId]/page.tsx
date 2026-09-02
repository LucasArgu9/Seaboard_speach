import { PhoneClient } from "@/components/play/PhoneClient";

export const dynamic = "force-dynamic";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <PhoneClient sessionId={sessionId} />;
}
