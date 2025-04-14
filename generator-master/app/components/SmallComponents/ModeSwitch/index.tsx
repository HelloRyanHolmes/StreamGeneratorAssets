"use client";

import React, { useState, useEffect } from "react";

const ModeSwitch: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  const toggleMode = (mode: "light" | "dark") => {
    setIsDarkMode(mode === "dark");
  };

  return (
    <div className="mode-switcher flex flex-row bg-[#f9f9f9] border border-[#e0e0e0] rounded-md p-[4px]">
      <a
        className={`cursor-pointer switch ${
          !isDarkMode
            ? "active-switch bg-[#040714] text-[white]"
            : "bg-[transparent] text-[#928F9F]"
        } rounded-md py-[6px] px-[8px] text-[12px] font-medium leading-[1.1] tracking-tight flex justify-center items-center flex-grow`}
        onClick={() => toggleMode("light")}
      >
        Light Mode
      </a>
      <a
        className={`cursor-pointer switch ${
          isDarkMode
            ? "active-switch bg-[#040714] text-[white]"
            : "bg-[transparent] text-[#928F9F]"
        } rounded-md py-[4px] px-[8px] text-[12px] font-medium leading-[1.1] tracking-tight flex justify-center items-center flex-grow`}
        onClick={() => toggleMode("dark")}
      >
        Dark Mode
      </a>
    </div>
  );
};

export default ModeSwitch;
