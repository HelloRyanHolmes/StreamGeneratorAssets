"use client";

import React, { useState, useEffect, useRef } from "react";
import ModeSwitch from "../SmallComponents/ModeSwitch";
import Selector from "../SmallComponents/Selector";
import MultipleSelector from "../SmallComponents/MultipleSelector";
import ChevronDown from "../IconUI/ChevronDown";
import { Collection } from "../../types/collection";

interface PanelBarProps {
  onCollectionSelect: (collection: Collection | null) => void;
  onAttributeSelect: (attribute: string | null) => void;
  onResolutionSelect: (resolution: "original" | "hd" | "ultra-hd") => void;
}

const PanelBar: React.FC<PanelBarProps> = ({
  onCollectionSelect,
  onAttributeSelect,
  onResolutionSelect,
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New state for dropdown
  const [isOpen, setIsOpen] = useState<boolean>(false); // Manage dropdown open/close state
  const dropdownRef = useRef<HTMLDivElement>(null); // Create a ref for the dropdown

  const [selectedResolution, setSelectedResolution] = useState<
    "original" | "hd" | "ultra-hd"
  >("original"); // New state for selected resolution

  const resolutionOptions = [
    { label: "Original", value: "original" },
    { label: "HD", value: "hd" },
    { label: "Ultra HD", value: "ultra-hd" },
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen); // Toggle the dropdown state
  };

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true); // Set loading to true
      try {
        const param = "yourParameter"; // Define the parameter you want to send
        const response = await fetch(`/api/CollectionData?param=${param}`); // Call the new API route with the parameter
        if (!response.ok) {
          throw new Error("Failed to fetch collections");
        }
        const data = await response.json();
        setCollections(data.collections);

        // Select the first collection
        const firstCollection = data.collections[0];
        setSelectedCollection(firstCollection);
        onCollectionSelect(firstCollection);

        // Select the first attribute of the first collection
        if (firstCollection && firstCollection.attributes.length > 0) {
          const firstAttribute = firstCollection.attributes[0].attributeName;
          setSelectedAttribute(firstAttribute);
          onAttributeSelect(firstAttribute);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        setError("Failed to load collections."); // Set error message
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    fetchCollections();
  }, [onCollectionSelect, onAttributeSelect]);

  const handleCollectionChange = (value: string) => {
    const selected = collections.find(
      (c) => c.name.toLowerCase().replace(/\s+/g, "-") === value
    );

    if (selected) {
      setSelectedCollection(selected);
      onCollectionSelect(selected);

      // Automatically select the first attribute of the new collection
      if (selected.attributes.length > 0) {
        const firstAttribute = selected.attributes[0].attributeName;
        setSelectedAttribute(firstAttribute);
        onAttributeSelect(firstAttribute);
      } else {
        setSelectedAttribute(null);
        onAttributeSelect(null);
      }
    } else {
      setSelectedCollection(null);
      onCollectionSelect(null);
      setSelectedAttribute(null);
      onAttributeSelect(null);
    }
  };

  const handleResolutionChange = (value: string) => {
    const resolution = value as "original" | "hd" | "ultra-hd";
    setSelectedResolution(resolution); // Update the state with the selected resolution
    onResolutionSelect(resolution);
  };

  // Render loading or error state
  if (loading)
    return (
      <div className="sidebar lg:w-[30%] md:w-[50%] w-full h-full bg-white rounded-md p-[8px]">
        <div className="content-sidebar flex flex-col gap-[8px]">
          <ModeSwitch />
          <div className="selector-area flex flex-row justify-between items-center gap-[8px]">
            <span className="text-[12px] text-[#928F9F] font-medium flex w-[60px]">
              Collection
            </span>
            <div
              ref={dropdownRef}
              className="dropdown relative flex flex-grow p-[6px] px-[8px] rounded-md bg-[#e2e2eb] cursor-pointer"
              onClick={toggleDropdown}
            >
              <div className="current-dropdown flex flex-row justify-between items-center w-full">
                <span className="text-[12px] text-[#040714] font-medium">
                  Loading...
                </span>
                <ChevronDown width={14} height={14} strokeColor="#040714" />
              </div>

              <div
                className={`dropdown-menu absolute p-[6px] px-[8px] bg-[white] border z-[100] border-[#d7d7e0] shadow-md rounded-md w-full right-0 mt-[30px] flex flex-col gap-[4px] transition-all duration-300 ease-in-out ${
                  isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                {collections.map((c) => (
                  <a
                    key={c.name.toLowerCase().replace(/\s+/g, "-")}
                    className={`text-[12px] ${
                      selectedCollection?.name
                        .toLowerCase()
                        .replace(/\s+/g, "-") ===
                      c.name.toLowerCase().replace(/\s+/g, "-")
                        ? "active-dropdown-item text-[#040714]"
                        : "text-[#928F9F]"
                    } hover:text-[#040714] hover:bg-[#e2e2eb] transition-colors duration-300 font-medium py-[4px] px-[8px] rounded-md`}
                    onClick={() =>
                      handleCollectionChange(
                        c.name.toLowerCase().replace(/\s+/g, "-")
                      )
                    }
                  >
                    {c.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  if (error) return <div>{error}</div>;

  return (
    <div className="sidebar lg:w-[325px] md:w-[325px] w-full h-full bg-white rounded-md p-[8px]">
      <div className="content-sidebar flex flex-col gap-[8px]">
        <ModeSwitch />
        <Selector
          label="Collection"
          options={collections.map((c) => ({
            label: c.name,
            value: c.name.toLowerCase().replace(/\s+/g, "-"),
          }))}
          defaultValue={selectedCollection?.name
            .toLowerCase()
            .replace(/\s+/g, "-")}
          onChange={handleCollectionChange}
          loading={loading}
        />

        <Selector
          label="Resolution"
          options={resolutionOptions}
          defaultValue={selectedResolution}
          onChange={handleResolutionChange}
          loading={loading}
        />

        {selectedCollection && (
          <MultipleSelector
            attributes={selectedCollection.attributes}
            onAttributeSelect={(attributeName) => {
              setSelectedAttribute(attributeName);
              onAttributeSelect(attributeName);
            }}
            defaultAttribute={selectedAttribute}
          />
        )}
      </div>
    </div>
  );
};

export default PanelBar;
