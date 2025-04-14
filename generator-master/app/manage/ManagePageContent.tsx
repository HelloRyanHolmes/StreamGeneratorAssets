"use client";

import React, { useState, useEffect } from "react";

interface Attribute {
  attributeName: string;
  maxAttributes: number;
  OrderImages: number;
}

interface Collection {
  name: string;
  AssetsUrlPath: string;
  attributes: Attribute[];
}

interface JsonData {
  collections: Collection[];
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const EditIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white
        ${type === "success" ? "bg-emerald-500" : "bg-red-500"}
        animate-toast-slide-in
        hover:translate-x-0 hover:opacity-100
        transform transition-all duration-300 ease-in-out
        cursor-pointer
        max-w-md
        backdrop-blur-sm bg-opacity-90
        hover:bg-opacity-100
        border border-white/10
      `}
      onClick={onClose}
      role="alert"
    >
      <div className="shrink-0">
        {type === "success" ? (
          <svg
            className="w-5 h-5 animate-toast-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 animate-toast-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </div>
      {message}
    </div>
  );
};

const CACHE_KEY = "collection-manager-data";

export default function ManagePageContent({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editingCollection, setEditingCollection] = useState<number | null>(
    null
  );
  const [editingAttribute, setEditingAttribute] = useState<{
    collection: string;
    index: number;
  } | null>(null);
  const [jsonString, setJsonString] = useState("");
  const [editingAssetsUrl, setEditingAssetsUrl] = useState<string | null>(null);
  const [editingAttributeDetails, setEditingAttributeDetails] = useState<{
    collectionIndex: number;
    attributeIndex: number;
    field: "maxAttributes" | "OrderImages" | null;
  } | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(
    null
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load data from cache on initial render
  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setCollections(parsedData.collections);
        setJsonString(JSON.stringify(parsedData, null, 2));
      } catch (error) {
        console.error("Error loading cached data:", error);
      }
    }
  }, []);

  // Update cache whenever collections change
  useEffect(() => {
    if (collections.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ collections }));
    }
  }, [collections]);

  const clearCache = () => {
    if (
      confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      localStorage.removeItem(CACHE_KEY);
      setCollections([]);
      setJsonString("");
      setSelectedCollection(null);
      setEditingCollection(null);
      setEditingAttribute(null);
      setEditingAttributeDetails(null);
      showToast("All data has been cleared", "success");
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data: JsonData = JSON.parse(content);

          // Check if there's existing data
          if (collections.length > 0) {
            if (
              confirm(
                "Uploading a new JSON file will replace existing data. Do you want to continue?"
              )
            ) {
              setCollections(data.collections);
              setJsonString(JSON.stringify(data, null, 2));
              showToast("JSON file uploaded successfully", "success");
            }
          } else {
            setCollections(data.collections);
            setJsonString(JSON.stringify(data, null, 2));
            showToast("JSON file uploaded successfully", "success");
          }
        } catch (error) {
          showToast("Invalid JSON format", "error");
        }
      };
      reader.readAsText(file);
    }
  };

  const addCollection = () => {
    const newCollection: Collection = {
      name: "New Collection",
      AssetsUrlPath: "",
      attributes: [],
    };
    setCollections([...collections, newCollection]);
    setEditingCollection(collections.length);
    updateJsonString([...collections, newCollection]);
  };

  const updateCollection = (index: number, updates: Partial<Collection>) => {
    const updatedCollections = collections.map((c, i) =>
      i === index ? { ...c, ...updates } : c
    );
    setCollections(updatedCollections);
    updateJsonString(updatedCollections);
  };

  const deleteCollection = (index: number) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      const updatedCollections = collections.filter((_, i) => i !== index);
      setCollections(updatedCollections);
      updateJsonString(updatedCollections);
      showToast("Collection deleted", "success");
    }
  };

  const addAttribute = (collectionIndex: number) => {
    const collection = collections[collectionIndex];
    const newAttribute: Attribute = {
      attributeName: "New Attribute",
      maxAttributes: 1,
      OrderImages: collection.attributes.length + 1,
    };
    const updatedCollection = {
      ...collection,
      attributes: [...collection.attributes, newAttribute],
    };
    updateCollection(collectionIndex, updatedCollection);
    setEditingAttribute({
      collection: collection.name,
      index: collection.attributes.length,
    });
  };

  const updateAttribute = (
    collectionIndex: number,
    attrIndex: number,
    updates: Partial<Attribute>
  ) => {
    const collection = collections[collectionIndex];
    const updatedAttributes = collection.attributes.map((attr, i) =>
      i === attrIndex ? { ...attr, ...updates } : attr
    );
    updateCollection(collectionIndex, { attributes: updatedAttributes });
  };

  const deleteAttribute = (collectionIndex: number, attrIndex: number) => {
    if (confirm("Are you sure you want to delete this attribute?")) {
      const collection = collections[collectionIndex];
      const updatedAttributes = collection.attributes.filter(
        (_, i) => i !== attrIndex
      );
      updateCollection(collectionIndex, { attributes: updatedAttributes });
      showToast("Attribute deleted", "success");
    }
  };

  const updateJsonString = (updatedCollections: Collection[]) => {
    setJsonString(JSON.stringify({ collections: updatedCollections }, null, 2));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    showToast("JSON copied to clipboard!", "success");
  };

  const downloadJson = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "collections.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("JSON file downloaded!", "success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Collection Manager
            </h1>
            <p className="mt-1 text-slate-600">
              Manage your collections and attributes with ease
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl 
              hover:bg-indigo-700 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={clearCache}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl 
                hover:bg-yellow-600 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear Data
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl 
                hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Collections
                  </h2>
                  <button
                    onClick={addCollection}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl 
                      hover:bg-emerald-600 transition-all duration-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Collection
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {collections.map((collection, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedCollection(index)}
                    className="p-4 cursor-pointer transition-all duration-200 group relative"
                    style={{
                      borderLeft:
                        selectedCollection === index
                          ? "3px solid #9552ff"
                          : "3px solid transparent",
                      backgroundColor:
                        selectedCollection === index
                          ? "rgba(191, 219, 254, 0.5)"
                          : "transparent",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      {editingCollection === index ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={collection.name}
                            onChange={(e) =>
                              updateCollection(index, { name: e.target.value })
                            }
                            className="flex-1 px-3 py-2 bg-white text-slate-900 border border-slate-300 
                              rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setEditingCollection(null);
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCollection(null);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 
                              rounded-lg transition duration-200"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900 flex items-center gap-2">
                              {collection.name}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCollection(index);
                                }}
                                className={`p-1.5 text-slate-400 rounded-lg transition-all duration-200
                                  ${
                                    selectedCollection === index
                                      ? "opacity-100 hover:text-blue-600 hover:bg-blue-100"
                                      : "opacity-0 group-hover:opacity-100 hover:text-blue-600 hover:bg-blue-50"
                                  }`}
                              >
                                <EditIcon />
                              </button>
                            </h3>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-sm ${
                                selectedCollection === index
                                  ? "text-blue-600"
                                  : "text-slate-500"
                              }`}
                            >
                              {collection.attributes.length} attributes
                            </span>
                            <svg
                              className={`w-5 h-5 transition-all duration-200 ${
                                selectedCollection === index
                                  ? "text-blue-500 opacity-100"
                                  : "text-slate-400 opacity-0 group-hover:opacity-100"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
              {selectedCollection !== null ? (
                <>
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-slate-800">
                        {collections[selectedCollection].name}
                      </h2>
                      <button
                        onClick={() => deleteCollection(selectedCollection)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl"
                      >
                        Delete Collection
                      </button>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-medium text-slate-700">
                        Assets URL
                      </label>
                      <input
                        type="text"
                        value={collections[selectedCollection].AssetsUrlPath}
                        onChange={(e) =>
                          updateCollection(selectedCollection, {
                            AssetsUrlPath: e.target.value,
                          })
                        }
                        className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-slate-800">Attributes</h3>
                      <button
                        onClick={() => addAttribute(selectedCollection)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-emerald-500 text-white rounded-xl"
                      >
                        Add Attribute
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {collections[selectedCollection].attributes.map(
                        (attr, attrIndex) => (
                          <div
                            key={attrIndex}
                            className="flex items-center justify-between group bg-slate-50 p-4 rounded-xl
                            hover:bg-slate-100 transition duration-200"
                          >
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex-1">
                                {editingAttribute?.collection ===
                                  collections[selectedCollection].name &&
                                editingAttribute.index === attrIndex ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={attr.attributeName}
                                      onChange={(e) =>
                                        updateAttribute(
                                          selectedCollection,
                                          attrIndex,
                                          {
                                            attributeName: e.target.value,
                                          }
                                        )
                                      }
                                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 
                                      rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          setEditingAttribute(null)
                                        }
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 
                                        rounded-lg transition duration-200"
                                        title="Save"
                                      >
                                        <svg
                                          className="w-5 h-5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() =>
                                          setEditingAttribute(null)
                                        }
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 
                                        rounded-lg transition duration-200"
                                        title="Cancel"
                                      >
                                        <svg
                                          className="w-5 h-5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-800">
                                      {attr.attributeName}
                                    </span>
                                    <button
                                      onClick={() =>
                                        setEditingAttribute({
                                          collection:
                                            collections[selectedCollection]
                                              .name,
                                          index: attrIndex,
                                        })
                                      }
                                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 
                                      hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition duration-200"
                                      title="Edit Name"
                                    >
                                      <EditIcon />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                                <span className="text-sm text-slate-500">
                                  Max:
                                </span>
                                {editingAttributeDetails?.collectionIndex ===
                                  selectedCollection &&
                                editingAttributeDetails.attributeIndex ===
                                  attrIndex &&
                                editingAttributeDetails.field ===
                                  "maxAttributes" ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={attr.maxAttributes}
                                      onChange={(e) =>
                                        updateAttribute(
                                          selectedCollection,
                                          attrIndex,
                                          {
                                            maxAttributes:
                                              parseInt(e.target.value) || 0,
                                          }
                                        )
                                      }
                                      className="w-20 px-2 py-1 bg-white text-slate-900 border border-slate-300 
                                      rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                      min="0"
                                      autoFocus
                                    />
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() =>
                                          setEditingAttributeDetails(null)
                                        }
                                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 
                                        rounded-lg transition duration-200"
                                        title="Save"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() =>
                                          setEditingAttributeDetails(null)
                                        }
                                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 
                                        rounded-lg transition duration-200"
                                        title="Cancel"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-700">
                                      {attr.maxAttributes}
                                    </span>
                                    <button
                                      onClick={() =>
                                        setEditingAttributeDetails({
                                          collectionIndex: selectedCollection,
                                          attributeIndex: attrIndex,
                                          field: "maxAttributes",
                                        })
                                      }
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 
                                      hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition duration-200"
                                      title="Edit Max Attributes"
                                    >
                                      <EditIcon />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                                <span className="text-sm text-slate-500">
                                  Order:
                                </span>
                                {editingAttributeDetails?.collectionIndex ===
                                  selectedCollection &&
                                editingAttributeDetails.attributeIndex ===
                                  attrIndex &&
                                editingAttributeDetails.field ===
                                  "OrderImages" ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={attr.OrderImages}
                                      onChange={(e) =>
                                        updateAttribute(
                                          selectedCollection,
                                          attrIndex,
                                          {
                                            OrderImages:
                                              parseInt(e.target.value) || 0,
                                          }
                                        )
                                      }
                                      className="w-20 px-2 py-1 bg-white text-slate-900 border border-slate-300 
                                      rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                      min="0"
                                      autoFocus
                                    />
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() =>
                                          setEditingAttributeDetails(null)
                                        }
                                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 
                                        rounded-lg transition duration-200"
                                        title="Save"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() =>
                                          setEditingAttributeDetails(null)
                                        }
                                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 
                                        rounded-lg transition duration-200"
                                        title="Cancel"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-700">
                                      {attr.OrderImages}
                                    </span>
                                    <button
                                      onClick={() =>
                                        setEditingAttributeDetails({
                                          collectionIndex: selectedCollection,
                                          attributeIndex: attrIndex,
                                          field: "OrderImages",
                                        })
                                      }
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 
                                      hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition duration-200"
                                      title="Edit Order"
                                    >
                                      <EditIcon />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                deleteAttribute(selectedCollection, attrIndex)
                              }
                              className="opacity-0 group-hover:opacity-100 p-2 text-red-500 
                              hover:bg-red-50 rounded-xl transition duration-200"
                              title="Delete Attribute"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <p>Select a collection to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex gap-3 lg:flex-row md:flex-row flex-col justify-between lg:items-center md:items-center items-start">
              <h2 className="text-xl font-semibold text-slate-800">
                JSON Preview
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl 
                    hover:bg-indigo-700 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copy
                </button>
                <button
                  onClick={downloadJson}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl 
                    hover:bg-emerald-600 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="bg-slate-50 p-4 rounded-xl text-sm whitespace-pre-wrap">
                <code className="text-slate-800">{jsonString}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
