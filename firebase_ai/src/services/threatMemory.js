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
 * @returns {Promise<{isSafe: boolean, hash: string, threatData?: object}>}
 */
export async function scanUploadAgainstMemory(file, userId) {
  try {
    // 1. Calculate the file's hash
    const fileHash = await calculateFileHash(file);
    
    // 2. Check if this hash exists in old threats
    const existingThreat = await checkThreatByHash(fileHash);
    
    // 3. If a known high/critical threat is found, auto-block it
    if (existingThreat && (existingThreat.riskLevel === 'high' || existingThreat.riskLevel === 'critical')) {
      console.warn(`Upload blocked: File matches known threat (${fileHash})`);
      
      // Log the blocked upload attempt
      await logUpload(userId, file.name, null, 'blocked_known_threat');
      
      return {
        isSafe: false,
        hash: fileHash,
        threatData: existingThreat
      };
    }
    
    // 4. File is not a known threat, proceed
    return {
      isSafe: true,
      hash: fileHash
    };
  } catch (error) {
    console.error("Error scanning upload against threat memory: ", error);
    throw new Error("Failed to process file against threat memory");
  }
}
