import { UploadZone } from "@/components/upload-zone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UploadPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload a design</h1>
        <p className="text-muted-foreground">
          Drop your UI screenshot and let our AI panel roast it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New roast</CardTitle>
          <CardDescription>
            Supports PNG, JPG, and WEBP up to 10MB. Select your design type for
            more targeted feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadZone />
        </CardContent>
      </Card>
    </div>
  );
}
