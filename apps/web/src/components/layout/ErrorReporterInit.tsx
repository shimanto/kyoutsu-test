"use client";

import { useEffect } from "react";
import { initErrorReporter, reportWebVitals } from "@/lib/error-reporter";

export function ErrorReporterInit() {
  useEffect(() => {
    initErrorReporter();
    reportWebVitals();
  }, []);
  return null;
}
