import Link from "next/link";
import Image from "next/image";
import { Plus, FileImage } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreCard } from "@/components/score-card";
import type { Analysis, AnalysisResult } from "@/types/analysis";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const items = (analyses || []) as Analysis[];

  const avgScore =
    items.length > 0
      ? Math.round(
          items.reduce(
            (sum, a) =>
              sum + (a.analysis as AnalysisResult).overall_score,
            0
          ) / items.length
        )
      : 0;

  const latestAnalysis = items[0]?.analysis as AnalysisResult | undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Your design roast history and scores.
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Plus />
            New Roast
          </Link>
        </Button>
      </div>

      {items.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <ScoreCard label="Total Roasts" score={items.length} />
          <ScoreCard label="Avg Score" score={avgScore} />
          {latestAnalysis && (
            <>
              <ScoreCard label="Latest UX" score={latestAnalysis.ux_score} />
              <ScoreCard
                label="Latest Visual"
                score={latestAnalysis.visual_score}
              />
              <ScoreCard
                label="Latest A11y"
                score={latestAnalysis.accessibility_score}
              />
            </>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <FileImage className="mb-4 text-muted-foreground" />
          <CardHeader className="text-center">
            <CardTitle>No roasts yet</CardTitle>
            <CardDescription>
              Upload your first UI screenshot to get AI-powered design feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/upload">
                <Plus />
                Upload your first design
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const result = item.analysis as AnalysisResult;
            return (
              <Link key={item.id} href={`/analysis/${item.id}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <div className="relative aspect-video bg-muted">
                    <Image
                      src={item.image_url}
                      alt="Design screenshot"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Score: {result.overall_score}/100
                      </CardTitle>
                      <Badge variant="secondary">
                        {new Date(item.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {result.summary}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
