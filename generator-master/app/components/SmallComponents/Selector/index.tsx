"use client";

import React, { useState, useRef, useEffect } from "react";
import ChevronDown from "../../IconUI/ChevronDown";

interface SelectorOption {
  label: string;
  value: string;
}

interface SelectorProps {
  label: string;
  options: SelectorOption[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  loading?: boolean; // New loading prop
}

const Selector: React.FC<SelectorProps> = ({
  label,
  options,
  defaultValue,
  onChange,
  loading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectorOption | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (options.length > 0) {
      const defaultOption =
        options.find((option) => option.value === defaultValue) || options[0];
      setSelectedOption(defaultOption);
    }
  }, [options, defaultValue]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option: SelectorOption) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option.value);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="selector-area flex flex-row justify-between items-center gap-[8px]">
      <span className="text-[12px] text-[#928F9F] font-medium flex w-[60px]">
        {label}
      </span>
      <div
        ref={dropdownRef}
        className="dropdown relative flex flex-grow p-[6px] px-[8px] rounded-md bg-[#f9f9f9] cursor-pointer"
        onClick={toggleDropdown}
      >
        <div className="current-dropdown flex flex-row justify-between items-center w-full">
          <span className="text-[12px] text-[#040714] font-medium">
            {loading
              ? "Loading..."
              : selectedOption
              ? selectedOption.label
              : "Select..."}{" "}
            {/* Updated to show loading */}
          </span>
          <ChevronDown width={14} height={14} strokeColor="#040714" />
        </div>

        <div
          className={`dropdown-menu absolute p-[6px] px-[8px] bg-[white] border z-[100] border-[#d7d7e0] shadow-md rounded-md w-full right-0 mt-[30px] flex flex-col gap-[4px] transition-all duration-300 ease-in-out ${
            isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          {options.map((option) => (
            <a
              key={option.value}
              className={`text-[12px] ${
                selectedOption?.value === option.value
                  ? "active-dropdown-item text-[#040714]"
                  : "text-[#928F9F]"
              } hover:text-[#040714] hover:bg-[#f9f9f9] transition-colors duration-300 font-medium py-[4px] px-[8px] rounded-md`}
              onClick={() => handleOptionSelect(option)}
            >
              {option.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Selector;
