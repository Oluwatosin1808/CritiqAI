import Link from "next/link";
import {
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalysisPreview } from "@/components/analysis-preview";
import type { AnalysisResult } from "@/types/analysis";

const EXAMPLE_ANALYSIS: AnalysisResult = {
  overall_score: 72,
  ux_score: 68,
  visual_score: 78,
  accessibility_score: 61,
  conversion_score: 74,
  summary:
    "A clean SaaS landing page with strong visual hierarchy, but CTA contrast and mobile spacing need work before launch.",
  strengths: [
    "Clear value proposition above the fold",
    "Consistent typography and spacing grid",
    "Social proof section builds trust effectively",
  ],
  issues: [
    "Primary CTA lacks sufficient color contrast (WCAG AA fail)",
    "Hero image competes with headline for attention",
    "Pricing cards have uneven visual weight",
  ],
  recommendations: [
    "Increase CTA button contrast to at least 4.5:1 ratio",
    "Reduce hero image opacity or move below fold on mobile",
    "Add sticky nav CTA for scroll-depth conversion",
  ],
};

const FEATURES = [
  {
    icon: Zap,
    title: "Instant feedback",
    description:
      "Upload a screenshot and get a full design review in under 30 seconds.",
  },
  {
    icon: BarChart3,
    title: "Structured scores",
    description:
      "UX, visual, accessibility, and conversion scores — all in one report.",
  },
  {
    icon: Shield,
    title: "Expert panel",
    description:
      "AI trained to think like a UX designer, PM, a11y expert, and CRO specialist.",
  },
];

const FEATURE_ANIM_CLASSES = [
  "fade-up fade-up-delay-1",
  "fade-up fade-up-delay-2",
  "fade-up fade-up-delay-3",
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: ["3 roasts per month", "Basic scores", "Email support"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    features: [
      "Unlimited roasts",
      "Full recommendations",
      "Design history",
      "Priority analysis",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    features: [
      "Everything in Pro",
      "Team dashboard",
      "Shared libraries",
      "API access",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="text-primary" />
            AI-powered design reviews
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            <span className="typewriter block text-primary">
              Get your UI roasted by AI experts
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Upload any UI screenshot and receive actionable feedback from a
            panel of AI design experts — UX, accessibility, conversion, and
            more.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Upload your design
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Example roast */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:items-center">
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold">See what you&apos;ll get</h2>
              <p className="text-muted-foreground">
                Every roast includes scores, a summary, strengths, issues, and
                specific recommendations you can act on immediately.
              </p>
            </div>
            <AnalysisPreview
              className="bounce-card"
              analysis={EXAMPLE_ANALYSIS}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Built for product teams
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <Card
                key={feature.title}
                className={FEATURE_ANIM_CLASSES[index % FEATURE_ANIM_CLASSES.length]}
              >
                <CardHeader>
                  <feature.icon className="mb-2 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-4 text-center text-3xl font-bold">
              Simple pricing
            </h2>
            <p className="mb-12 text-center text-muted-foreground">
              Start free. Upgrade when you need more roasts.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {PLANS.map((plan) => (
                <Card
                  key={plan.name}
                  className={
                    plan.highlighted ? "border-primary shadow-lg" : undefined
                  }
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <ul className="flex flex-col gap-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.highlighted ? "default" : "outline"}
                      className="w-full"
                      asChild
                    >
                      <Link href="/signup">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold">Ready to improve your UI?</h2>
          <p className="text-muted-foreground">
            Join designers and product teams using Critiq to ship better
            interfaces faster.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">
              Start roasting for free
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t bg-background/80 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-6 border-b border-muted-foreground/10 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">Built by Oluwatosin</p>
              <p className="text-sm text-muted-foreground">
                AI design feedback for product teams.
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Critiq.
          </p>
        </div>
      </footer>
    </div>
  );
}
