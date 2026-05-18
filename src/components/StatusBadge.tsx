import type { IntensityColour } from "../domain/intensity";

interface StatusBadgeProps {
  colour: IntensityColour;
  label: string;
}

export const StatusBadge = ({ colour, label }: StatusBadgeProps) => (
  <span className={`badge badge--${colour}`}>
    <span className="badge__dot" aria-hidden="true" />
    {label} CARBON
  </span>
);
