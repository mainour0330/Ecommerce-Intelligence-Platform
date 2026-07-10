// ══════════════════════════════════════════════════════════════
//  Azure Storage Integration
//  ──────────────────────────────────────────────────────────────
//  Reads CSV files from Azure Blob Storage and converts them to JSON
//  يقرأ ملفات CSV من Azure Blob Storage ويحولها إلى JSON
// ══════════════════════════════════════════════════════════════

import { BlobServiceClient } from "@azure/storage-blob";
import csv from "csvtojson";
import dotenv from "dotenv";

// Load environment variables / تحميل متغيرات البيئة
dotenv.config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER;

if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is not defined in .env file");
}

if (!containerName) {
  throw new Error("AZURE_CONTAINER is not defined in .env file");
}

// Initialize Azure Blob Service Client
// تهيئة عميل Azure Blob
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

/**
 * Read CSV file from Azure Blob Storage and convert to JSON
 * قراءة ملف CSV من Azure Blob Storage وتحويله إلى JSON
 * 
 * @param {string} fileName - Name of the CSV file (e.g., "customers.csv")
 * @param {string} container - Container name (optional, defaults to env variable)
 * @returns {Promise<Array>} - Array of objects representing CSV rows
 */
export async function readCSV(fileName, container = null) {
  try {
    const targetContainer = container || containerName;
    console.log(`📥 Reading ${fileName} from container: ${targetContainer}...`);
    
    // Get container client / الحصول على عميل الحاوية
    const containerClient = blobServiceClient.getContainerClient(targetContainer);
    
    // Get blob client for the specific file / الحصول على عميل البلوب للملف المحدد
    const blobClient = containerClient.getBlobClient(fileName);
    
    // Check if blob exists / التحقق من وجود البلوب
    const exists = await blobClient.exists();
    if (!exists) {
      console.error(`❌ File ${fileName} not found in container ${targetContainer}`);
      throw new Error(`File ${fileName} not found in container ${targetContainer}`);
    }
    
    // Download blob / تنزيل البلوب
    const download = await blobClient.download();
    
    // Convert stream to string / تحويل التدفق إلى نص
    const text = await streamToString(download.readableStreamBody);
    
    // Parse CSV to JSON / تحليل CSV إلى JSON
    const data = await csv().fromString(text);
    
    console.log(`✅ Successfully loaded ${data.length} records from ${fileName}`);
    
    return data;
  } catch (error) {
    console.error(`❌ Error reading ${fileName} from Azure:`, error.message);
    throw error;
  }
}

/**
 * List all containers in the storage account
 * عرض جميع الحاويات في حساب التخزين
 * 
 * @returns {Promise<Array>} - Array of container names
 */
export async function listContainers() {
  try {
    console.log(`📦 Listing all containers...`);
    const containers = [];
    
    for await (const container of blobServiceClient.listContainers()) {
      containers.push({
        name: container.name,
        lastModified: container.properties.lastModified,
        publicAccess: container.properties.publicAccess || 'Private'
      });
    }
    
    console.log(`✅ Found ${containers.length} containers`);
    return containers;
  } catch (error) {
    console.error("❌ Error listing containers:", error.message);
    throw error;
  }
}

/**
 * List files in a specific container
 * عرض الملفات في حاوية محددة
 * 
 * @param {string} container - Container name
 * @returns {Promise<Array>} - Array of file information
 */
export async function listContainerFiles(container) {
  try {
    console.log(`📂 Listing files in container: ${container}...`);
    const containerClient = blobServiceClient.getContainerClient(container);
    const files = [];
    
    for await (const blob of containerClient.listBlobsFlat()) {
      files.push({
        name: blob.name,
        size: blob.properties.contentLength,
        sizeFormatted: formatBytes(blob.properties.contentLength),
        type: getFileType(blob.name),
        lastModified: blob.properties.lastModified,
        contentType: blob.properties.contentType
      });
    }
    
    console.log(`✅ Found ${files.length} files in ${container}`);
    return files;
  } catch (error) {
    console.error(`❌ Error listing files in ${container}:`, error.message);
    throw error;
  }
}

/**
 * Convert a readable stream to a string
 * تحويل تدفق قابل للقراءة إلى نص
 * 
 * @param {ReadableStream} stream - The stream to convert
 * @returns {Promise<string>} - The complete string content
 */
async function streamToString(stream) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk.toString()));
    stream.on("end", () => resolve(chunks.join("")));
    stream.on("error", reject);
  });
}

/**
 * List all CSV files in the Azure container
 * عرض جميع ملفات CSV في حاوية Azure
 * 
 * @returns {Promise<Array<string>>} - Array of CSV file names
 */
export async function listCSVFiles() {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const csvFiles = [];
    
    for await (const blob of containerClient.listBlobsFlat()) {
      if (blob.name.endsWith('.csv')) {
        csvFiles.push(blob.name);
      }
    }
    
    console.log(`📂 Found ${csvFiles.length} CSV files in Azure Storage:`, csvFiles);
    return csvFiles;
  } catch (error) {
    console.error("❌ Error listing CSV files:", error.message);
    throw error;
  }
}

/**
 * List all files and folders in Azure container (hierarchical view)
 * عرض جميع الملفات والمجلدات في حاوية Azure (عرض هرمي)
 * 
 * @returns {Promise<Object>} - Organized structure of folders and files
 */
export async function listAllFilesAndFolders() {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const structure = {
      container: containerName,
      folders: {},
      rootFiles: [],
      totalFiles: 0,
      totalFolders: 0,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`📂 Scanning Azure Storage container: ${containerName}...`);
    
    // Use hierarchy listing to get folder structure
    for await (const item of containerClient.listBlobsByHierarchy("/")) {
      if (item.kind === "prefix") {
        // It's a folder
        const folderName = item.name.replace(/\/$/, '');
        structure.folders[folderName] = {
          name: folderName,
          files: [],
          fileCount: 0,
          totalSize: 0
        };
        structure.totalFolders++;
        
        // List files in this folder
        for await (const blob of containerClient.listBlobsFlat({ prefix: item.name })) {
          const fileInfo = {
            name: blob.name.split('/').pop(),
            fullPath: blob.name,
            size: blob.properties.contentLength,
            sizeFormatted: formatBytes(blob.properties.contentLength),
            type: getFileType(blob.name),
            lastModified: blob.properties.lastModified,
            contentType: blob.properties.contentType
          };
          
          structure.folders[folderName].files.push(fileInfo);
          structure.folders[folderName].fileCount++;
          structure.folders[folderName].totalSize += blob.properties.contentLength;
          structure.totalFiles++;
        }
        
        structure.folders[folderName].totalSizeFormatted = 
          formatBytes(structure.folders[folderName].totalSize);
        
      } else if (item.kind === "blob") {
        // It's a root-level file
        const fileInfo = {
          name: item.name,
          fullPath: item.name,
          size: item.properties.contentLength,
          sizeFormatted: formatBytes(item.properties.contentLength),
          type: getFileType(item.name),
          lastModified: item.properties.lastModified,
          contentType: item.properties.contentType
        };
        
        structure.rootFiles.push(fileInfo);
        structure.totalFiles++;
      }
    }
    
    console.log(`✅ Found ${structure.totalFolders} folders and ${structure.totalFiles} files`);
    return structure;
    
  } catch (error) {
    console.error("❌ Error listing files and folders:", error.message);
    throw error;
  }
}

/**
 * Get detailed information about a specific file
 * الحصول على معلومات مفصلة عن ملف معين
 * 
 * @param {string} blobName - Full path to the blob
 * @returns {Promise<Object>} - Detailed file information
 */
export async function getFileInfo(blobName) {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    
    const properties = await blobClient.getProperties();
    
    return {
      name: blobName.split('/').pop(),
      fullPath: blobName,
      size: properties.contentLength,
      sizeFormatted: formatBytes(properties.contentLength),
      type: getFileType(blobName),
      contentType: properties.contentType,
      lastModified: properties.lastModified,
      createdOn: properties.createdOn,
      etag: properties.etag,
      url: blobClient.url
    };
  } catch (error) {
    console.error(`❌ Error getting info for ${blobName}:`, error.message);
    throw error;
  }
}

/**
 * Helper: Format bytes to human readable format
 * مساعد: تحويل البايتات إلى صيغة قابلة للقراءة
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Helper: Get file type from extension
 * مساعد: الحصول على نوع الملف من الامتداد
 */
function getFileType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const types = {
    'csv': 'CSV Data',
    'json': 'JSON Data',
    'parquet': 'Parquet Data',
    'txt': 'Text File',
    'xml': 'XML File',
    'xlsx': 'Excel File',
    'pdf': 'PDF Document'
  };
  return types[ext] || 'Unknown';
}

/**
 * Test Azure connection
 * اختبار الاتصال بـ Azure
 * 
 * @returns {Promise<boolean>} - True if connection is successful
 */
export async function testConnection() {
  try {
    console.log("🔍 Testing Azure Storage connection...");
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const exists = await containerClient.exists();
    
    if (exists) {
      console.log("✅ Azure Storage connection successful!");
      return true;
    } else {
      console.log(`⚠️  Container '${containerName}' does not exist`);
      return false;
    }
  } catch (error) {
    console.error("❌ Azure Storage connection failed:", error.message);
    return false;
  }
}

// Export container info for debugging / تصدير معلومات الحاوية للتصحيح
export const azureConfig = {
  containerName,
  hasConnectionString: !!connectionString,
  accountName: 'olistlake01'
};
