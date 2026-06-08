import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreCard } from "@/components/score-card";
import type { Analysis, AnalysisResult } from "@/types/analysis";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalysisPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!data) notFound();

  const analysis = data as Analysis;
  const result = analysis.analysis as AnalysisResult;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft />
            Back to dashboard
          </Link>
        </Button>
      </div>

      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Design Roast</h1>
          <Badge variant="secondary">
            {new Date(analysis.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Badge>
        </div>
        <p className="text-muted-foreground">{result.summary}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-muted">
            <Image
              src={analysis.image_url}
              alt="Analyzed design"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ScoreCard label="Overall" score={result.overall_score} />
            <ScoreCard label="UX" score={result.ux_score} />
            <ScoreCard label="Visual" score={result.visual_score} />
            <ScoreCard label="Accessibility" score={result.accessibility_score} />
            <ScoreCard label="Conversion" score={result.conversion_score} />
          </div>

          <Tabs defaultValue="strengths" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="strengths" className="flex-1">
                Strengths
              </TabsTrigger>
              <TabsTrigger value="issues" className="flex-1">
                Issues
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex-1">
                Tips
              </TabsTrigger>
            </TabsList>

            <TabsContent value="strengths">
              <FeedbackList
                items={result.strengths}
                icon={CheckCircle2}
                emptyMessage="No strengths identified."
              />
            </TabsContent>
            <TabsContent value="issues">
              <FeedbackList
                items={result.issues}
                icon={AlertCircle}
                emptyMessage="No issues found."
              />
            </TabsContent>
            <TabsContent value="recommendations">
              <FeedbackList
                items={result.recommendations}
                icon={Lightbulb}
                emptyMessage="No recommendations."
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Full summary</CardTitle>
          <CardDescription>
            AI panel assessment of your design
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground">
            {result.summary}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function FeedbackList({
  items,
  icon: Icon,
  emptyMessage,
}: {
  items: string[];
  icon: React.ComponentType<{ className?: string }>;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <Icon className="mt-0.5 shrink-0 text-primary" />
            <p className="text-sm">{item}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
