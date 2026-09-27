export type IdType = "CEDULA" | "RUC" | "PASAPORTE";

export const ECUADOR_LOCATIONS: Record<string, string[]> = {
  Pichincha: ["Quito", "Rumiñahui (Sangolquí)", "Cayambe", "Mejía (Machachi)"],
  Guayas: ["Guayaquil", "Samborondón", "Daule", "Durán"],
  Azuay: ["Cuenca", "Gualaceo", "Paute"],
  Manabí: ["Manta", "Portoviejo", "Montecristi"],
  Tungurahua: ["Ambato", "Baños de Agua Santa", "Pelileo"],
  Imbabura: ["Ibarra", "Otavalo", "Cotacachi"],
  Loja: ["Loja", "Catamayo"],
  "Santo Domingo": ["Santo Domingo"],
  "El Oro": ["Machala", "Pasaje"],
};

/**
 * Valida algorítmicamente una Cédula ecuatoriana (10 dígitos - Módulo 10)
 */
export function isValidEcuadorianCedula(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;

  const provinceCode = parseInt(cedula.substring(0, 2), 10);
  const thirdDigit = parseInt(cedula.substring(2, 3), 10);

  // Provincias válidas: 01 a 24, o 30 (ecuatorianos en el exterior)
  if ((provinceCode < 1 || provinceCode > 24) && provinceCode !== 30) {
    return false;
  }
  if (thirdDigit >= 6) return false;

  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let value = parseInt(cedula.charAt(i), 10) * coefficients[i];
    if (value >= 10) value -= 9;
    sum += value;
  }

  const verifierDigit = parseInt(cedula.charAt(9), 10);
  const calculatedVerifier = sum % 10 === 0 ? 0 : 10 - (sum % 10);

  return verifierDigit === calculatedVerifier;
}

/**
 * Valida RUC ecuatoriano (13 dígitos: Personas Naturales, Sociedades Privadas o Públicas)
 */
export function isValidEcuadorianRuc(ruc: string): boolean {
  if (!/^\d{13}$/.test(ruc)) return false;

  const branchCode = ruc.substring(10, 13);
  if (branchCode === "000") return false;

  const provinceCode = parseInt(ruc.substring(0, 2), 10);
  if ((provinceCode < 1 || provinceCode > 24) && provinceCode !== 30) {
    return false;
  }

  const thirdDigit = parseInt(ruc.substring(2, 3), 10);

  // Personas naturales: los primeros 10 dígitos cumplen validación de cédula
  if (thirdDigit >= 0 && thirdDigit < 6) {
    return isValidEcuadorianCedula(ruc.substring(0, 10));
  }

  // Sociedades privadas (tercer dígito = 9) o públicas (tercer dígito = 6)
  return thirdDigit === 6 || thirdDigit === 9;
}

/**
 * Función unificada para el Checkout
 */
export function validateBillingIdentification(type: IdType, value: string): {
  valid: boolean;
  error?: string;
} {
  const clean = value.trim();
  if (type === "CEDULA") {
    return isValidEcuadorianCedula(clean)
      ? { valid: true }
      : { valid: false, error: "La cédula ingresada no es válida en Ecuador." };
  }
  if (type === "RUC") {
    return isValidEcuadorianRuc(clean)
      ? { valid: true }
      : { valid: false, error: "El RUC debe tener 13 dígitos válidos y terminar en 001 o superior." };
  }
  if (type === "PASAPORTE") {
    return clean.length >= 5 && clean.length <= 20
      ? { valid: true }
      : { valid: false, error: "Ingrese un número de pasaporte válido." };
  }
  return { valid: false, error: "Tipo de identificación no soportado." };
}