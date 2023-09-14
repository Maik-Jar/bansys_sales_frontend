export function isNumeric(str) {
  return /^\d+$/.test(str);
}

export function hasPermission(permission) {
  const userAccess = JSON.parse(localStorage.getItem("token"));
  const backendPermission = userAccess.permissions;
  let hasPermision = false;
  if (backendPermission?.find((e) => e === permission)) {
    hasPermision = true;
  }
  return hasPermision;
}
