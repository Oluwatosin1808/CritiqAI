import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/types/analysis";

interface AnalysisPreviewProps {
  analysis: AnalysisResult;
  className?: string;
}

export function AnalysisPreview({ analysis, className }: AnalysisPreviewProps) {
  return (
    <Card className={"border-primary/20 " + (className ?? "")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Design Roast Preview</CardTitle>
          <Badge variant="secondary">
            Score: {analysis.overall_score}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{analysis.summary}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ScorePill label="UX" score={analysis.ux_score} />
          <ScorePill label="Visual" score={analysis.visual_score} />
          <ScorePill label="A11y" score={analysis.accessibility_score} />
          <ScorePill label="CRO" score={analysis.conversion_score} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Top issue</p>
          <p className="text-sm text-muted-foreground">
            {analysis.issues[0] || "No issues found"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ScorePill({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-lg bg-muted px-3 py-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{score}</p>
    </div>
  );
}
