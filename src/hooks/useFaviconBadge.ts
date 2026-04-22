import { useEffect } from "react";

export const useFaviconBadge = (count: number) => {
  useEffect(() => {
    // 1. Update Document Title
    const baseTitle = document.title.replace(/^\[\d+\]\s\|\s/, "");
    if (count > 0) {
      document.title = `[${count}] | ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }

    // 2. Update Favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) return;

    if (count <= 0) {
      favicon.href = "/favicon.ico";
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = "/favicon.ico";
    img.onload = () => {
      ctx.clearRect(0, 0, 32, 32);
      ctx.drawImage(img, 0, 0, 32, 32);

      // Draw Badge Background (Larger radius for Better Visibility)
      ctx.beginPath();
      ctx.arc(22, 22, 10, 0, 2 * Math.PI);
      ctx.fillStyle = "#ef4444"; // red-500
      ctx.fill();

      // Draw Badge Border
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Badge Text (Larger font size)
      ctx.fillStyle = "white";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(count > 9 ? "9+" : count.toString(), 22, 22);

      favicon.href = canvas.toDataURL("image/png");
    };
  }, [count]);
};
