import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  label: string;
  score: number;
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-chart-3";
  if (score >= 60) return "text-chart-4";
  return "text-destructive";
}

export function ScoreCard({ label, score, className }: ScoreCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn("text-3xl font-bold", getScoreColor(score))}>
          {score}
        </p>
      </CardContent>
    </Card>
  );
}
