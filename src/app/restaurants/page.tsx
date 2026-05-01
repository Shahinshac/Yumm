"use client";

import { Suspense } from "react";
import RestaurantsPageContent from "./content";

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestaurantsPageContent />
    </Suspense>
  );
}

