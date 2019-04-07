export const capitalize = str => {
  const lower = String(str).toLowerCase();
  return lower.replace(/(^| )(\w)/g, function(x) {
    return x.toUpperCase();
  });
};
