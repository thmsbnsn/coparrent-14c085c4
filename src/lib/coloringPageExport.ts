/**
 * Coloring Page Export Utilities
 * 
 * This module provides specialized export functions for coloring pages,
 * built on top of the shared CoParrent Creations export utility.
 */

import { 
  generateCreationsPdf, 
  openCreationsPrintView, 
  downloadCreationPng 
} from './creationsExport';

/**
 * Export coloring page to PDF with CoParrent Creations branding
 */
export async function exportColoringPagePDF(
  imageUrl: string,
  prompt: string
): Promise<void> {
  const sanitizedPrompt = prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-');
  
  return generateCreationsPdf({
    title: 'CoParrent Creations',
    subtitle: prompt.length > 60 ? prompt.slice(0, 60) + '...' : prompt,
    imageDataUrl: imageUrl,
    filename: `${sanitizedPrompt}-coloring-page`,
  });
}

/**
 * Print coloring page with CoParrent Creations branding header
 */
export function printColoringPage(imageUrl: string, prompt: string): void {
  openCreationsPrintView({
    title: 'CoParrent Creations',
    subtitle: prompt.length > 80 ? prompt.slice(0, 80) + '...' : prompt,
    imageUrl,
    imageAlt: 'Coloring page',
  });
}

/**
 * Download coloring page as PNG
 */
export function downloadColoringPagePNG(imageUrl: string, prompt: string): void {
  const sanitizedPrompt = prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-');
  downloadCreationPng(imageUrl, `${sanitizedPrompt}-coloring-page`);
}
