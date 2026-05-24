// Using the background image from public folder
export function getFixedBackgroundKey() {
  return 'bg-1'; // Always use the same background
}

export async function getOptimizedBackgrounds(getImage: any) {
  return {
    'bg-1': '/images/wallpaper/wallpaper.png',
  };
}
