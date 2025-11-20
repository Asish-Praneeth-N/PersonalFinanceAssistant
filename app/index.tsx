// app/index.tsx
import React from 'react';
import { Redirect } from 'expo-router';

// Using <Redirect/> instead of router.replace in a useEffect ensures navigation
// happens after layout mounts and avoids "Attempted to navigate before mounting..." errors.
export default function Index() {
  return <Redirect href="/splash" />;
}