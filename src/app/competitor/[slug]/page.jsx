import { CompetitorDetailPage } from "@/components/competitor-detail-page";

export default async function CompetitorDetailRoute({ params }) {
  const { slug } = await params;
  return <CompetitorDetailPage slug={slug} />;
}
