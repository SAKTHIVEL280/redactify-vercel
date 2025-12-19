// IndexedDB utility for Pro license key storage
const DB_NAME = 'ResumeRedactorDB';
const DB_VERSION = 2; // Must match customRulesDB version
const STORE_NAME = 'proLicense';

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Store Pro license key
export const storeProKey = async (licenseData) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const data = {
      id: 'pro_license',
      key: licenseData.key,
      orderId: licenseData.orderId,
      paymentId: licenseData.paymentId,
      purchasedAt: licenseData.purchasedAt || new Date().toISOString(),
      expiresAt: null, // One-time purchase, no expiry
      isActive: true
    };
    
    await store.put(data);
    return { success: true, data };
  } catch (error) {
    console.error('Error storing Pro key:', error);
    return { success: false, error: error.message };
  }
};

// Retrieve Pro license key
export const getProKey = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get('pro_license');
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.isActive) {
          resolve({ isValid: true, data: result });
        } else {
          resolve({ isValid: false, data: null });
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error retrieving Pro key:', error);
    return { isValid: false, data: null };
  }
};

// Verify Pro status
export const verifyProStatus = async () => {
  const result = await getProKey();
  return result.isValid;
};

// Delete Pro license (for testing/refund scenarios)
export const deleteProKey = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await store.delete('pro_license');
    return { success: true };
  } catch (error) {
    console.error('Error deleting Pro key:', error);
    return { success: false, error: error.message };
  }
};
