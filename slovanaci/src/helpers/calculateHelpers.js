export const calculatePercentage = (part, total) =>{
    if (total === 0) {
        return 0; // Avoid division by zero
    }
    return Math.round((part / total) * 100);
  }
