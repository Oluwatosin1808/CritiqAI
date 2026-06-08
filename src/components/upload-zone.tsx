"use client";

import Image from "next/image";
import { useCallback, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DesignType } from "@/types/analysis";
import { toast } from "sonner";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

const DESIGN_TYPES: { value: DesignType; label: string }[] = [
  { value: "landing_page", label: "Landing page" },
  { value: "mobile_app", label: "Mobile app" },
  { value: "dashboard", label: "Dashboard" },
  { value: "saas_product", label: "SaaS product" },
];

type UploadResponse = {
  error?: { message?: string };
  message?: string;
  data?: { imageUrl?: string };
  imageUrl?: string;
};

type AnalyzeResponse = {
  error?: { message?: string };
  message?: string;
  data?: { id?: string };
  id?: string;
};

export function UploadZone() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [designType, setDesignType] = useState<DesignType>("landing_page");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback((selected: File) => {
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toast.error("Please upload a PNG, JPG, or WEBP image.");
      return;
    }
    if (selected.size > MAX_SIZE) {
      toast.error("Image must be under 10MB.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  async function handleSubmit() {
    if (!file) {
      toast.error("Please select an image first.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadJson =
        (await uploadRes.json().catch(() => null)) as UploadResponse | null;

      if (!uploadRes.ok) {
        const message =
          uploadJson?.error?.message || uploadJson?.message || "Upload failed";
        throw new Error(message);
      }

      const imageUrl =
        uploadJson?.data?.imageUrl || uploadJson?.imageUrl;

      if (!imageUrl || typeof imageUrl !== "string") {
        throw new Error("Upload response did not return a valid image URL.");
      }

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, designType }),
      });

      const analyzeJson =
        (await analyzeRes.json().catch(() => null)) as AnalyzeResponse | null;

      if (!analyzeRes.ok) {
        const message =
          analyzeJson?.error?.message || analyzeJson?.message || "Analysis failed";
        throw new Error(message);
      }

      const id = analyzeJson?.data?.id || analyzeJson?.id;

      if (!id || typeof id !== "string") {
        throw new Error("Analyze response did not return a valid analysis id.");
      }
      router.push(`/analysis/${id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const selected = e.target.files?.[0];
            if (selected) handleFile(selected);
          }}
        />
        {preview ? (
          <Image
            src={preview}
            alt="Preview"
            width={760}
            height={400}
            unoptimized
            className="max-h-64 rounded-lg object-contain"
          />
        ) : (
          <>
            <Upload className="mb-4 text-muted-foreground" />
            <p className="text-center font-medium">
              Drag & drop your UI screenshot
            </p>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              PNG, JPG, or WEBP up to 10MB
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="design-type">Design type</Label>
        <Select
          value={designType}
          onValueChange={(v) => setDesignType(v as DesignType)}
        >
          <SelectTrigger id="design-type">
            <SelectValue placeholder="Select design type" />
          </SelectTrigger>
          <SelectContent>
            {DESIGN_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={!file || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="animate-spin" />
            Analyzing your design...
          </>
        ) : (
          "Roast my design"
        )}
      </Button>
    </div>
  );
}
