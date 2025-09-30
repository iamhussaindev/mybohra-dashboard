import React from "react";
import { IconSparkles } from "@tabler/icons-react";
const Subtitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="text-md subtitle shimmer font-clash-display flex items-center gap-2 text-[var(--text-secondary)]">
      <IconSparkles className="text-highlight-primary w-4 h-4" />
      <span className="text-highlight-primary text-sm md:text-base">{children}</span>
    </span>
  );
};

export default Subtitle;
