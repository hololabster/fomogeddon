// Format address for display
export const formatAddress = (address) => {
  if (!address) return "";

  // If address already has ellipsis formatting
  if (address.includes("...")) return address;

  // Format full address to show first and last characters
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};
