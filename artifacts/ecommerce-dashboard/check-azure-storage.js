// ══════════════════════════════════════════════════════════════
//  Azure Storage Explorer - Complete Scanner
//  مستكشف Azure Storage الكامل
// ══════════════════════════════════════════════════════════════

import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

// Both connection strings
const connectionString1 = "YOUR_FIRST_CONNECTION_STRING_HERE"; // Replace with your first connection string
const connectionString2 = "YOUR_SECOND_CONNECTION_STRING_HERE"; // Replace with your second connection string

async function exploreStorage(connectionString, label) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  🔍 Exploring: ${label}`);
  console.log(`${'='.repeat(70)}\n`);
  
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    
    // List all containers
    console.log("📦 Listing all containers...\n");
    const containers = [];
    
    for await (const container of blobServiceClient.listContainers()) {
      containers.push(container.name);
      console.log(`  ✅ Container: ${container.name}`);
      console.log(`     Properties:`);
      console.log(`     - Last Modified: ${container.properties.lastModified}`);
      console.log(`     - Public Access: ${container.properties.publicAccess || 'Private'}`);
      console.log();
    }
    
    if (containers.length === 0) {
      console.log("  ⚠️  No containers found\n");
      return;
    }
    
    console.log(`\n📊 Found ${containers.length} container(s)\n`);
    console.log(`${'─'.repeat(70)}\n`);
    
    // Explore each container
    for (const containerName of containers) {
      await exploreContainer(blobServiceClient, containerName);
    }
    
  } catch (error) {
    console.error(`\n❌ Error exploring storage:`, error.message);
    console.error(`   Error Code:`, error.code);
  }
}

async function exploreContainer(blobServiceClient, containerName) {
  console.log(`\n📂 CONTAINER: ${containerName}`);
  console.log(`${'─'.repeat(70)}`);
  
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Check if container exists
    const exists = await containerClient.exists();
    if (!exists) {
      console.log(`  ⚠️  Container does not exist or access denied\n`);
      return;
    }
    
    // Explore hierarchical structure (folders)
    console.log(`\n🗂️  Exploring folder structure...\n`);
    
    const structure = {
      folders: new Map(),
      rootFiles: [],
      totalFiles: 0,
      totalSize: 0
    };
    
    // First pass: discover folders using hierarchy
    const folders = new Set();
    for await (const item of containerClient.listBlobsByHierarchy("/")) {
      if (item.kind === "prefix") {
        const folderPath = item.name.replace(/\/$/, '');
        folders.add(folderPath);
        console.log(`  📁 Folder: ${folderPath}/`);
      } else if (item.kind === "blob") {
        structure.rootFiles.push({
          name: item.name,
          size: item.properties.contentLength,
          lastModified: item.properties.lastModified
        });
        structure.totalFiles++;
        structure.totalSize += item.properties.contentLength;
      }
    }
    
    // Explore each folder
    for (const folderPath of folders) {
      console.log(`\n  📂 Scanning folder: ${folderPath}/`);
      
      const folderFiles = [];
      let folderSize = 0;
      
      // List all blobs in this folder (recursive)
      for await (const blob of containerClient.listBlobsFlat({ prefix: folderPath + "/" })) {
        const relativePath = blob.name.replace(folderPath + "/", "");
        const depth = relativePath.split("/").length - 1;
        const indent = "  ".repeat(depth + 2);
        
        if (depth === 0) {
          // Direct file in folder
          console.log(`${indent}📄 ${relativePath} (${formatBytes(blob.properties.contentLength)})`);
        } else {
          // File in subfolder
          console.log(`${indent}📄 ${relativePath} (${formatBytes(blob.properties.contentLength)})`);
        }
        
        folderFiles.push({
          name: blob.name,
          size: blob.properties.contentLength,
          lastModified: blob.properties.lastModified
        });
        
        folderSize += blob.properties.contentLength;
        structure.totalFiles++;
        structure.totalSize += blob.properties.contentLength;
      }
      
      structure.folders.set(folderPath, {
        files: folderFiles,
        size: folderSize
      });
      
      console.log(`  └─ Total: ${folderFiles.length} files, ${formatBytes(folderSize)}`);
    }
    
    // Summary for this container
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📊 Container Summary:`);
    console.log(`   Folders: ${folders.size}`);
    console.log(`   Root Files: ${structure.rootFiles.length}`);
    console.log(`   Total Files: ${structure.totalFiles}`);
    console.log(`   Total Size: ${formatBytes(structure.totalSize)}`);
    console.log(`${'─'.repeat(70)}\n`);
    
    // List root files if any
    if (structure.rootFiles.length > 0) {
      console.log(`\n📄 Root Level Files:`);
      structure.rootFiles.forEach(file => {
        console.log(`   - ${file.name} (${formatBytes(file.size)})`);
      });
    }
    
  } catch (error) {
    console.error(`\n❌ Error exploring container ${containerName}:`, error.message);
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Main execution
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                    ║');
  console.log('║       Azure Storage Account: olistlake01                          ║');
  console.log('║       Complete Storage Explorer                                    ║');
  console.log('║       مستكشف Azure Storage الكامل                                 ║');
  console.log('║                                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  
  // Explore with both connection strings
  await exploreStorage(connectionString1, "Connection String 1 (Key 1)");
  await exploreStorage(connectionString2, "Connection String 2 (Key 2)");
  
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                    ║');
  console.log('║       ✅ Exploration Complete!                                     ║');
  console.log('║          اكتمل الاستكشاف!                                         ║');
  console.log('║                                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');
}

// Run
main().catch(console.error);
