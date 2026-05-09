import { checkThreatByHash, logUpload } from '../config/firebase.js';

/**
 * Calculates the SHA-256 hash of a file
 * @param {File|Blob} file - The file to hash
 * @returns {Promise<string>} - The hex representation of the SHA-256 hash
 */
export async function calculateFileHash(file) {
  const arrayBuffer = await file.arrayBuffer();
  // Use Web Crypto API for SHA-256 hashing
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Process a new file upload, checking against threat memory
 * @param {File} file - The file being uploaded
 * @param {string} userId - The ID of the user uploading the file
 * @returns {Promise<{isKnownThreat: boolean, hash: string}>}
 */
export async function processFileThreat(file, userId) {
  try {
    // 1. Generates SHA256 hash of uploaded file
    const fileHash = await calculateFileHash(file);
    
    // 2. Checks Firestore if hash already exists in threats
    const existingThreat = await checkThreatByHash(fileHash);
    
    if (existingThreat) {
      // 3. If exists -> mark as known threat
      console.warn(`File matched known threat (${fileHash})`);
      await logUpload(userId, file.name, null, 'blocked_known_threat', fileHash);
      
      return {
        isKnownThreat: true,
        hash: fileHash
      };
    } else {
      // 4. If not -> store it
      await logUpload(userId, file.name, null, 'pending', fileHash);
      
      return {
        isKnownThreat: false,
        hash: fileHash
      };
    }
  } catch (error) {
    console.error("Error processing file against threat memory: ", error);
    throw new Error("Failed to process file threat");
  }
}
