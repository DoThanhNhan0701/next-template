"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackButton() {
    return (
        <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="gap-2"
        >
            <ArrowLeft className="w-5 h-5" />
            Go back
        </Button>
    );
}
