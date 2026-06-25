import {
  Footprints, CircleDot, Sparkles, Dumbbell, Wind, Briefcase,
} from 'lucide-react';

const MAP = {
  running:    Footprints,
  basketball: CircleDot,
  lifestyle:  Sparkles,
  training:   Dumbbell,
  casual:     Wind,
  formal:     Briefcase,
};

export default function CategoryIcon({ id, size = 26, className = '' }) {
  const Icon = MAP[id] || Wind;
  return <Icon size={size} className={className} />;
}
