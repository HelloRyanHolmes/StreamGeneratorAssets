import React, { useEffect, useRef, useState } from "react";
import Dice from "../IconUI/Dice";
import Download from "../IconUI/Download";
import Refresh from "../IconUI/Refresh";
import Crop from "../IconUI/Crop";
import Spinner from "../IconUI/Spinner";

interface SelectedLayer {
  collection: string;
  attribute: string;
  imageUrl: string;
  orderIndex: number;
}

interface PreviewAreaProps {
  selectedLayers: SelectedLayer[];
  onRefresh?: () => void;
  onRandomize?: () => void;
  isRandomizing?: boolean;
  isManualMode?: boolean;
  resolution: "original" | "hd" | "ultra-hd";
}

const PreviewArea: React.FC<PreviewAreaProps> = ({
  selectedLayers,
  onRefresh,
  onRandomize,
  isRandomizing = false,
  isManualMode = false,
  resolution,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [buttonText, setButtonText] = useState("Randomise");
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isRandomizing) {
      setButtonText("Loading...");
      setShowLoader(true);
    } else {
      const timer = setTimeout(() => {
        setButtonText("Randomise");
        setShowLoader(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isRandomizing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = 500;

    ctx.fillStyle = "#f9f9f9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawLayers = async () => {
      setShowLoader(true);
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#f9f9f9";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      try {
        const sortedLayers = [...selectedLayers].sort(
          (a, b) => a.orderIndex - b.orderIndex
        );

        const loadedImages = await Promise.all(
          sortedLayers.map(async (layer) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = layer.imageUrl;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            return { img, layer };
          })
        );

        loadedImages.forEach(({ img }) => {
          ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
        });
      } catch (error) {
        console.error("Error loading or drawing layers:", error);
      } finally {
        setShowLoader(false);
      }
    };

    drawLayers();
  }, [selectedLayers]);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const scaleFactor =
        resolution === "hd" ? 2 : resolution === "ultra-hd" ? 3 : 1;
      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = canvas.width * scaleFactor;
      scaledCanvas.height = canvas.height * scaleFactor;
      const scaledCtx = scaledCanvas.getContext("2d");

      if (scaledCtx) {
        scaledCtx.scale(scaleFactor, scaleFactor);
        scaledCtx.drawImage(canvas, 0, 0);
        const dataUrl = scaledCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "preview.png";
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <div className="preview-area lg:w-[30%] md:w-[50%] w-full h-full bg-white rounded-md p-[8px] flex flex-col gap-[8px]">
      <div className="canvas-area relative w-full h-[auto] aspect-square bg-[#f9f9f9] rounded-md border border-[#d7d7e0] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
        {showLoader && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#00000099]">
            <Spinner width={24} height={24} strokeColor="#ffffff" />
          </div>
        )}
      </div>

      <div className="btn-group-area flex flex-row gap-[8px]">
        <button
          onClick={onRandomize}
          disabled={showLoader || isManualMode}
          className={`btn-preview-area-canvas randomize-pick font-medium text-[12px] text-[#040714] flex flex-row gap-[4px] items-center justify-center border border-[#040714] rounded-md p-[6px] px-[8px] ${
            showLoader || isManualMode ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title={isManualMode ? "Manual selection mode active" : ""}
        >
          {!isManualMode && showLoader ? (
            <Spinner width={14} height={14} strokeColor="#040714" />
          ) : (
            <Dice width={14} height={14} strokeColor="#040714" />
          )}
          {buttonText}
        </button>

        <button
          onClick={onRefresh}
          disabled={showLoader}
          className={`btn-preview-area-canvas refresh font-medium text-[12px] text-[#040714] flex flex-row gap-[4px] items-center justify-center border border-[#040714] rounded-md p-[6px] px-[8px] ${
            showLoader ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Refresh width={14} height={14} strokeColor="#040714" />
          Refresh
        </button>

        <button
          onClick={handleDownload}
          disabled={showLoader}
          className={`btn-preview-area-canvas download-img font-medium text-[12px] text-[white] flex flex-row gap-[4px] items-center justify-center border border-[#040714] bg-[#040714] rounded-md p-[6px] px-[8px] w-[-webkit-fill-available] ${
            showLoader ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Download width={14} height={14} strokeColor="#ffffff" />
          Download
        </button>
      </div>
    </div>
  );
};

export default PreviewArea;
