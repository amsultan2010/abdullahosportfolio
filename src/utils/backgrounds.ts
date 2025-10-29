import hollywoodBackground from '../assets/images/hollywood-background.png';

// Using the Hollywood Hills background for all pages
export const backgrounds = [hollywoodBackground];

export function getFixedBackgroundKey() {
  return 'bg-1'; // Always use the same background
}

export async function getOptimizedBackgrounds(getImage: any) {
  const optimized = await getImage({
    src: hollywoodBackground,
    width: 3500,
  });

  return {
    'bg-1': optimized.src,
  };
}
