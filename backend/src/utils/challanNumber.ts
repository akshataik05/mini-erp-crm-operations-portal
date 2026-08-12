/**
 * Formats challan number as CHAL-YYYY-XXXX (e.g. CHAL-2026-0001)
 */
export const generateChallanNumber = (sequenceNumber: number): string => {
  const year = new Date().getFullYear();
  const formattedSeq = sequenceNumber.toString().padStart(4, '0');
  return `CHAL-${year}-${formattedSeq}`;
};
