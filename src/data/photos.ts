interface PhotoEntry {
  caption: string;
  /** ISO-like date string used by `new Date()`. Day is always 01 since we
   *  only display month + year. */
  createdAt: string;
}

const entries: PhotoEntry[] = [
  { caption: "me and fernando alonso, qatar gp",            createdAt: "2025-11-01" },
  { caption: "fernando alonso in the garage, qatar gp",     createdAt: "2025-11-01" },
  { caption: "masjid al-haram, makkah",                     createdAt: "2026-03-01" },
  { caption: "my setup, riyadh",                            createdAt: "2026-04-01" },
  { caption: "me at the gym, riyadh",                       createdAt: "2026-05-01" },
  { caption: "st peter's basilica, vatican city",           createdAt: "2026-02-01" },
  { caption: "two woodpeckers, riyadh",                     createdAt: "2026-01-01" },
  { caption: "novak djokovic, 6 kings slam",                createdAt: "2025-10-01" },
  { caption: "al-bustan, riyadh",                           createdAt: "2026-03-01" },
  { caption: "jeddah airport, jeddah",                      createdAt: "2026-03-01" },
  { caption: "me and an aston martin f1 car, dhahran",      createdAt: "2025-08-01" },
  { caption: "big ben, london",                             createdAt: "2025-07-01" },
  { caption: "the pingry school, basking ridge, nj",        createdAt: "2025-06-01" },
  { caption: "camponelli, u.c. berkeley",                   createdAt: "2025-05-01" },
  { caption: "my sister's graduation, u.c. berkeley",       createdAt: "2025-05-01" },
  { caption: "me playing tennis, basking ridge, nj",        createdAt: "2025-03-01" },
  { caption: "state championships, lawrenceville school, nj", createdAt: "2025-02-01" },
  { caption: "lucid police car, al-diriyah",                createdAt: "2025-02-01" },
  { caption: "kolachi restaurant, karachi",                 createdAt: "2025-12-01" },
  { caption: "northern lights, short hills, nj",            createdAt: "2025-02-01" },
  { caption: "field, rural japan",                          createdAt: "2024-08-01" },
];

export const photos = entries.map((entry, index) => {
  const imagePath = `/images/gallery/image${index + 1}.jpg`;

  return {
    src: imagePath,
    thumb: imagePath,
    alt: entry.caption,
    createdAt: entry.createdAt,
    caption: entry.caption,
  };
});
