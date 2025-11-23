// Utility function for consistent quantity management
export const adjustQuantity = (
    currentQuantity: number,
    change: number,
    min: number = 1,
    max?: number
  ): number => {
    const adjusted = currentQuantity + change;
    if (max !== undefined) {
      return Math.min(Math.max(min, adjusted), max);
    }
    return Math.max(min, adjusted);
  };