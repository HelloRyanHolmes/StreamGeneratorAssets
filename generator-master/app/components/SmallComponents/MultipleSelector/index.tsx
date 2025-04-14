import React, { useState, useEffect } from "react";

interface Attribute {
  attributeName: string;
  maxAttributes: number;
}

interface MultipleSelectorProps {
  attributes: Attribute[];
  onAttributeSelect: (attributeName: string) => void;
  defaultAttribute?: string | null;
}

const MultipleSelector: React.FC<MultipleSelectorProps> = ({
  attributes,
  onAttributeSelect,
  defaultAttribute,
}) => {
  const [activeAttribute, setActiveAttribute] = useState<string | null>(
    defaultAttribute || null
  );

  useEffect(() => {
    if (defaultAttribute) {
      setActiveAttribute(defaultAttribute);
      onAttributeSelect(defaultAttribute);
    }
  }, [defaultAttribute, onAttributeSelect]);

  const handleAttributeClick = (attributeName: string) => {
    setActiveAttribute(attributeName);
    onAttributeSelect(attributeName);
  };

  const formatDisplayText = (text: string) => {
    return text.replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <div className="multiple-selector grid grid-cols-2 gap-[8px]">
      {attributes.map((attribute, index) => {
        const originalValue = attribute.attributeName;
        const displayText = formatDisplayText(originalValue);

        return (
          <a
            key={index}
            className={`multiple-selector-item p-[6px] px-[8px] rounded-md bg-[transparent] border border-[#e0e0e0] text-[12px] font-medium text-[#928F9F] text-center hover:border-[#84848a] hover:text-[#84848a] cursor-pointer transition-all duration-300 ease-in-out ${
              originalValue === activeAttribute
                ? "active-msi hover:border-[#040714] hover:text-[#040714]"
                : ""
            }`}
            onClick={() => handleAttributeClick(originalValue)}
          >
            {displayText}
          </a>
        );
      })}
    </div>
  );
};

export default MultipleSelector;
