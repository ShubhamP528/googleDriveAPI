const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

// Load the service account credentials
const credentialsPath = path.join(__dirname, "credentials.json");
const auth = new google.auth.GoogleAuth({
  keyFile: credentialsPath,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

// Function to share a folder with a user's email
async function shareFolder(folderId, emailAddress) {
  try {
    // Grant permission to the email address
    await drive.permissions.create({
      fileId: folderId,
      requestBody: {
        type: "user", // Share with a specific user
        role: "writer", // Role can be 'reader', 'commenter', or 'writer'
        emailAddress: emailAddress,
      },
      emailMessage:
        "You have been invited to access this folder. Please accept the invitation.",
    });

    console.log(`Invitation sent to ${emailAddress}.`);

    // Get the folder's shareable link
    const result = await drive.files.get({
      fileId: folderId,
      fields: "webViewLink",
    });

    console.log("Folder is accessible at:", result.data.webViewLink);
  } catch (error) {
    console.error("Error sharing folder:", error.message);
  }
}

// Function to remove a user's access from a folder
async function removeFolderAccess(folderId, emailAddress) {
  try {
    // Get the list of permissions for the file
    const { data } = await drive.permissions.list({
      fileId: folderId,
      fields: "permissions(id, emailAddress)",
    });

    console.log(data);

    // Find the permission ID associated with the email address
    const permission = data.permissions.find(
      (perm) => perm.emailAddress === emailAddress
    );

    if (!permission) {
      console.log(`No permission found for ${emailAddress}.`);
      return;
    }

    // Remove the permission
    await drive.permissions.delete({
      fileId: folderId,
      permissionId: permission.id,
    });

    console.log(`Access removed for ${emailAddress}.`);
  } catch (error) {
    console.error("Error removing access:", error.message);
  }
}

// Function to grant restricted access to a folder
async function grantRestrictedAccess(folderId, emailAddress) {
  try {
    await drive.permissions.create({
      fileId: folderId,
      requestBody: {
        type: "user",
        role: "commenter", // Prevents downloading and editing
        emailAddress: emailAddress,
      },
      fields: "id",
    });

    console.log(`Restricted access granted to ${emailAddress}.`);
  } catch (error) {
    console.error("Error granting access:", error.message);
  }
}

// Function to grant access without download permissions
async function grantNoDownloadAccess(folderId, emailAddress) {
  try {
    // Grant commenter access to the user
    await drive.permissions.create({
      fileId: folderId,
      requestBody: {
        type: "user",
        role: "commenter", // Allows viewing and commenting
        emailAddress: emailAddress,
      },
      fields: "id",
    });

    console.log(
      `Access granted to ${emailAddress} without download permissions.`
    );

    // Apply content restriction to prevent downloading, printing, and copying
    // await drive.files.update({
    //   fileId: folderId,
    //   requestBody: {
    //     contentRestrictions: [
    //       {
    //         readOnly: true,
    //         reason: "Prevent downloading, printing, and copying",
    //       },
    //     ],
    //   },
    // });

    await drive.files.update({
      fileId: folderId,
      requestBody: {
        contentRestrictions: [
          {
            readOnly: true,
            reason: "Prevent downloading, printing, and copying",
          },
        ],
      },
    });

    console.log(
      `Access granted to ${emailAddress} with download restrictions.`
    );
  } catch (error) {
    console.log(error);
    console.error("Error granting access:", error.message);
  }
}

async function listFiles() {
  try {
    const res = await drive.files.list({
      pageSize: 10, // Number of files to list
      fields: "files(id, name)", // Fields to retrieve
    });

    const files = res.data.files;
    if (files.length) {
      console.log("Files:");
      files.forEach((file) => {
        console.log(`Name: ${file.name}, ID: ${file.id}`);
      });
    } else {
      console.log("No files found.");
    }
  } catch (error) {
    console.error("Error listing files:", error);
  }
}

async function uploadFile() {
  try {
    const fileMetadata = {
      name: "example.pdf", // The name of the file in Google Drive
    };

    const media = {
      mimeType: "application/pdf", // Change this based on file type
      body: fs.createReadStream(path.join(__dirname, "example.pdf")), // File to upload
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    console.log("Uploaded File ID:", file.data.id);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

async function createFolder(folderName) {
  // Initialize the metadata object for the folder
  const folderMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder", // MimeType for folders
  };

  try {
    // Create the folder in the root directory
    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
    });

    console.log("Folder ID:", folder.data.id);
    return folder.data.id; // Return the folder ID
  } catch (error) {
    console.error("Error creating folder:", error);
  }
}

async function uploadFileToFolder(fileName, folderId) {
  // Initialize the metadata object for the file
  const fileMetadata = {
    name: fileName,
    parents: [folderId], // Specify the parent folder ID
  };

  const filePath = path.join(__dirname, "send_email.py");

  const media = {
    mimeType: getMimeType(filePath), // Get mimeType based on file extension
    body: fs.createReadStream(filePath),
  };

  try {
    // Upload the file to the specified folder
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    console.log("Uploaded File ID:", file.data.id);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

async function createNestedFolder(parentFolderId, subfolderName) {
  try {
    const folderMetadata = {
      name: subfolderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
    });

    console.log("Nested Folder ID:", folder.data.id);
    return folder.data.id;
  } catch (error) {
    console.error("Error creating nested folder:", error);
  }
}

// Function to get mimeType based on file extension
function getMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    // Add more mimeTypes as needed
  };
  return mimeTypes[extension] || "application/octet-stream"; // Default for unknown extensions
}

async function listAllFolders() {
  try {
    console.log("hello world");
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false", // Query for folders
      fields: "files(id, name)", // Specify what details to retrieve
      spaces: "drive", // Look in Google Drive
    });

    console.log("Accessible Folders:");
    response.data.files.forEach((folder) => {
      console.log(`- ${folder.name} (ID: ${folder.id})`);
    });
    console.log(response.data.files);
    console.log("folder done");

    return response.data.files;
  } catch (error) {
    console.error("Error listing folders:", error.message);
  }
}

module.exports = {
  shareFolder,
  listFiles,
  uploadFile,
  listAllFolders,
  createFolder,
  uploadFileToFolder,
  createNestedFolder,
  removeFolderAccess,
  grantRestrictedAccess,
  grantNoDownloadAccess,
}; // Export the function for use in other modules or scripts
