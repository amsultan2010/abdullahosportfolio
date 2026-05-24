const captions = [
  "build",
  "desk",
  "robotics",
  "projects",
  "school",
  "startup",
  "website",
  "travel",
  "notes",
  "setup",
  "build",
  "desk",
  "robotics",
  "projects",
  "school",
  "startup",
  "website",
  "travel",
  "notes",
  "setup",
  "projects",
];

export const photos = captions.map((caption, index) => {
  const imagePath = `/images/gallery/image${index + 1}.jpg`;

  return {
    src: imagePath,
    thumb: imagePath,
    alt: caption,
    createdAt: `2026-01-${String(index + 1).padStart(2, "0")}`,
    caption,
  };
});
