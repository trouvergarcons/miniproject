import React from "react";
import { GlowingEffect } from "./glowing-effect";

export const GlowingContainer = ({ children }) => {
  return (
    <div className="relative border rounded-2xl md:rounded-3xl">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        borderWidth={2}
        inactiveZone={0.01}
      />
      {children}
    </div>
  );
};