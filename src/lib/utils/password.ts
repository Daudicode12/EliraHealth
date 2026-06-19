// src/lib/utils/password.ts

/**
 * Generate a secure temporary password
 * Requirements:
 * - 12 characters long
 * - Mix of uppercase letters
 * - Mix of lowercase letters
 * - Mix of numbers
 * - Mix of special characters
 * - Example output: "xY9@mK2$pL#Q"
 */
export function generateTempPassword(): string {
  const length = 12;
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ"; 
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const special = "@#$%*!?";
  
  const allChars = uppercase + lowercase + numbers + special;
  
  const getRandomValues = (buf: Uint8Array) => {
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(buf);
    } else if (typeof globalThis !== "undefined" && globalThis.crypto) {
      globalThis.crypto.getRandomValues(buf);
    } else {
      // Node fallback
      const nodeCrypto = require("crypto");
      const bytes = nodeCrypto.randomBytes(buf.length);
      for (let i = 0; i < buf.length; i++) {
        buf[i] = bytes[i];
      }
    }
  };

  const buf = new Uint8Array(length);
  getRandomValues(buf);

  let password = "";
  // Ensure we have at least one character from each required set
  password += uppercase[buf[0] % uppercase.length];
  password += lowercase[buf[1] % lowercase.length];
  password += numbers[buf[2] % numbers.length];
  password += special[buf[3] % special.length];

  // Fill the remaining length with random characters from the combined set
  for (let i = 4; i < length; i++) {
    password += allChars[buf[i] % allChars.length];
  }

  // Shuffle the password array using a Fisher-Yates shuffle with fresh random values
  const shuffleBuf = new Uint8Array(length);
  getRandomValues(shuffleBuf);
  
  const arr = password.split("");
  for (let i = length - 1; i > 0; i--) {
    const j = shuffleBuf[i] % (i + 1);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  
  return arr.join("");
}
