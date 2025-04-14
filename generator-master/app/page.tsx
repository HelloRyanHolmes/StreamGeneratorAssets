"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import "./assets/style/main.css";
import PanelBar from "./components/PanelBar";
import PreviewArea from "./components/PreviewArea";
import ModeSwitch from "./components/SmallComponents/ModeSwitch";
import SkeletonLoader from "./components/SkeletonLoader";
import { SelectedLayer, createLayer } from "./utils/layerManager";

interface Collection {
  name: string;
  AssetsUrlPath: string;
  OrderImages: number[];
  attributes: Array<{
    attributeName: string;
    maxAttributes: number;
  }>;
}

export default function Home() {
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(
    null
  );
  const [localImageUrls, setLocalImageUrls] = useState<string[]>([]);
  const [downloadingImages, setDownloadingImages] = useState<Set<number>>(
    new Set()
  );
  const [imageStatuses, setImageStatuses] = useState<
    Map<number, "loading" | "loaded" | "error">
  >(new Map());
  const [currentAbortController, setCurrentAbortController] =
    useState<AbortController | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<SelectedLayer[]>([]);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [resolution, setResolution] = useState<"original" | "hd" | "ultra-hd">(
    "original"
  );

  useEffect(() => {
    // Cancel previous requests
    if (currentAbortController) {
      currentAbortController.abort();
    }

    // Reset states
    setImageStatuses(new Map());
    setLocalImageUrls([]);

    // Start new requests if we have valid selection
    if (selectedCollection && selectedAttribute) {
      const attribute = selectedCollection.attributes.find(
        (attr) => attr.attributeName === selectedAttribute
      );
      if (attribute) {
        const newController = new AbortController();
        setCurrentAbortController(newController);

        initializeImageStatuses(attribute.maxAttributes);
        fetchAndStoreImages(
          selectedCollection.AssetsUrlPath,
          selectedAttribute,
          attribute.maxAttributes,
          newController
        );
      }
    }

    // Cleanup function
    return () => {
      if (currentAbortController) {
        currentAbortController.abort();
      }
    };
  }, [selectedCollection, selectedAttribute]);

  useEffect(() => {
    // Reset selected layers when collection changes
    setSelectedLayers([]);
  }, [selectedCollection]);

  const initializeImageStatuses = (count: number) => {
    setImageStatuses(
      new Map(Array.from({ length: count }, (_, i) => [i, "loading"]))
    );
  };

  const fetchAndStoreImages = async (
    collection: string,
    attribute: string,
    count: number,
    controller: AbortController
  ) => {
    const BATCH_SIZE = 10;
    const batches = Math.ceil(count / BATCH_SIZE);

    try {
      for (let batch = 0; batch < batches; batch++) {
        if (controller.signal.aborted) return;

        const start = batch * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, count);
        const batchPromises = [];

        for (let i = start; i < end; i++) {
          batchPromises.push(
            getImageUrl(collection, attribute, i, controller.signal)
              .then((imageUrl) => {
                if (imageUrl && !controller.signal.aborted) {
                  setLocalImageUrls((prev) => {
                    const newUrls = [...prev];
                    newUrls[i] = imageUrl;
                    return newUrls;
                  });
                  setImageStatuses((prev) => new Map(prev).set(i, "loaded"));
                }
              })
              .catch(() => {
                if (!controller.signal.aborted) {
                  setImageStatuses((prev) => new Map(prev).set(i, "error"));
                }
              })
          );
        }

        await Promise.all(batchPromises);
      }
    } catch (err) {
      // Handle any unexpected errors
      console.error("Batch processing error:", err);
    }
  };

  const getImageUrl = async (
    collection: string,
    attribute: string,
    index: number,
    signal: AbortSignal
  ): Promise<string> => {
    const response = await fetch(
      `/api/RenderContent?collection=${encodeURIComponent(
        collection
      )}&attribute=${encodeURIComponent(attribute)}&index=${index + 1}`,
      { signal }
    );

    if (!response.ok) throw new Error("Failed to fetch image URL");
    const data = await response.json();
    return data.url;
  };

  const handleImageLoad = (index: number) => {
    setImageStatuses((prev) => new Map(prev).set(index, "loaded"));
  };

  const handleImageError = (index: number) => {
    setImageStatuses((prev) => new Map(prev).set(index, "error"));
  };

  const handleImageSelect = (imageSrc: string | null) => {
    if (!selectedCollection || !selectedAttribute) return;

    setIsManualMode(true);

    if (imageSrc === null) {
      // Remove the layer for this attribute
      setSelectedLayers((prev) =>
        prev.filter((layer) => layer.attribute !== selectedAttribute)
      );
      return;
    }

    setSelectedLayers((prev) => {
      const newLayer = createLayer(
        selectedCollection,
        selectedAttribute,
        imageSrc
      );

      // Replace existing layer of same attribute or add new one
      const existingIndex = prev.findIndex(
        (layer) => layer.attribute === selectedAttribute
      );
      if (existingIndex >= 0) {
        const newLayers = [...prev];
        newLayers[existingIndex] = newLayer;
        return newLayers;
      }
      return [...prev, newLayer];
    });
  };

  const handleRandomize = async () => {
    if (!selectedCollection || isRandomizing || isManualMode) return;

    setIsRandomizing(true);
    const controller = new AbortController();
    setCurrentAbortController(controller);

    try {
      // Create a map of attribute name to its order index
      const orderMap = new Map(
        selectedCollection.attributes.map((attr, index) => [
          attr.attributeName,
          selectedCollection.OrderImages?.[index] ?? index,
        ])
      );

      // Sort attributes by their OrderImages value (lower = bottom layer)
      const sortedAttributes = [...selectedCollection.attributes].sort(
        (a, b) =>
          (orderMap.get(a.attributeName) ?? 0) -
          (orderMap.get(b.attributeName) ?? 0)
      );

      // Create promises for each attribute in order
      const randomLayerPromises = sortedAttributes.map(async (attr) => {
        const randomIndex = Math.floor(Math.random() * attr.maxAttributes);

        try {
          const imageUrl = await getImageUrl(
            selectedCollection.AssetsUrlPath,
            attr.attributeName,
            randomIndex,
            controller.signal
          );

          return createLayer(selectedCollection, attr.attributeName, imageUrl);
        } catch (error) {
          if (controller.signal.aborted) {
            throw new Error("Operation cancelled");
          }
          console.error(
            `Failed to load random image for ${attr.attributeName}:`,
            error
          );
          return null;
        }
      });

      const newLayers = await Promise.all(randomLayerPromises);
      const validLayers = newLayers.filter(
        (layer): layer is SelectedLayer => layer !== null
      );

      setSelectedLayers(validLayers);
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error("Error in randomize:", error);
      }
    } finally {
      setCurrentAbortController(null);
      setIsRandomizing(false);
    }
  };

  const handleRefresh = () => {
    setSelectedLayers([]);
    setIsManualMode(false);
  };

  const renderContent = () => {
    if (!selectedCollection || !selectedAttribute) {
      return Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="att-img-item aspect-square relative">
          <div className="w-full h-full rounded-md border border-[#d7d7e0] overflow-hidden img-item-inner-att">
            <SkeletonLoader isLoaded={false} />
          </div>
        </div>
      ));
    }

    const isNoneSelected = !selectedLayers.some(
      (layer) => layer.attribute === selectedAttribute
    );

    return (
      <>
        <div
          className={`att-img-item aspect-square rounded-md border border-[#d7d7e0] bg-[#f9f9f9] overflow-hidden img-item-inner-att-none relative hover:border-[#928F9F] cursor-pointer ${
            isNoneSelected ? "active-selector-att" : ""
          }`}
          onClick={() => handleImageSelect(null)}
        >
          <div className="none absolute top-0 left-0">
            <span className="text-[#928F9F] px-2 py-1 bg-[#f9f9f9] relative z-10 font-medium text-[12px]">
              NONE
            </span>
          </div>
        </div>
        {Array.from({ length: imageStatuses.size }, (_, i) => {
          const status = imageStatuses.get(i) || "loading";
          const imageSrc = localImageUrls[i] || "";
          const isSelected = selectedLayers.some(
            (layer) =>
              layer.attribute === selectedAttribute &&
              layer.imageUrl === imageSrc
          );

          return (
            <div
              key={i}
              className={`att-img-item aspect-square relative ${
                status === "loaded" ? "loaded" : ""
              } ${isSelected ? "active-selector-att" : ""}`}
              onClick={() => status === "loaded" && handleImageSelect(imageSrc)}
            >
              <div
                className={`w-full h-full rounded-md border bg-[#f9f9f9] border-[#d7d7e0] transition-all duration-300 ease-in-out overflow-hidden img-item-inner-att ${
                  status === "loaded" ? "cursor-pointer" : ""
                }`}
              >
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt={`${selectedAttribute} ${i + 1}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out ${
                      status === "loaded" ? "opacity-100" : "opacity-0"
                    }`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(i)}
                    onError={() => handleImageError(i)}
                  />
                )}
                <SkeletonLoader
                  isLoaded={status === "loaded" && imageSrc !== ""}
                />
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <main
      id="root-hero"
      className="w-full lg:h-screen md:h-screen h-fit flex justify-center items-start"
    >
      {/* Button Top */}
      <div className="container-top-btn absolute top-0 left-0 w-full flex justify-center items-center p-[8px] z-10">
        <div className="wrapper-container-top-btn max-w-[1400px] w-full flex justify-center gap-[8px] items-center">
          <a
            href="https://richordietryan.club/"
            className="btn-preview-area-canvas download-img font-medium text-[12px] text-[#040714] flex flex-row gap-[4px] items-center justify-center border border-[#e0e0e0] bg-[white] rounded-md p-[6px] px-[8px] w-fit "
          >
            Website
          </a>

          {/*<a
            href="https://get.richordietryan.club/"
            className="btn-preview-area-canvas download-img font-medium text-[12px] text-[#040714] flex flex-row gap-[4px] items-center justify-center border border-[#e0e0e0] bg-[white] rounded-md p-[6px] px-[8px] w-fit "
          >
            Dapps
          </a>*/}
        </div>
      </div>
      {/* Button Top */}

      <div className="container max-w-[1400px] lg:max-h-[unset] md:max-h-[unset] max-h-[unset] p-[8px] flex flex-grow lg:flex-row md:flex-row flex-col lg:flex-nowrap md:flex-wrap flex-wrap gap-[8px] items-center">
        {/* Panel Bar Area */}
        <PanelBar
          onCollectionSelect={setSelectedCollection}
          onAttributeSelect={setSelectedAttribute}
          onResolutionSelect={setResolution}
        />
        {/* Panel Bar Area */}

        {/* Selector Attributes */}
        <div className="selector-attributes flex flex-grow lg:w-[65%] md:w-[65%] w-full h-full bg-white rounded-md p-[8px] max-h-[600px]">
          <div
            className="container-selector-attributes w-full h-[600px] grid lg:grid-cols-6 md:grid-cols-6 grid-cols-2 gap-[8px] overflow-auto max-h-[calc(600px-32px)]"
            style={{ gridAutoRows: "min-content" }}
            id="attributes-selector-area"
          >
            {renderContent()}
          </div>
        </div>
        {/* Selector Attributes */}

        {/* Preview Area */}
        <PreviewArea
          selectedLayers={selectedLayers}
          onRefresh={handleRefresh}
          onRandomize={handleRandomize}
          isRandomizing={isRandomizing}
          isManualMode={isManualMode}
          resolution={resolution}
        />
        {/* Preview Area */}
      </div>
    </main>
  );
}
