const express = require("express");
const path = require("path");
const {
  listFiles,
  uploadFile,
  listAllFolders,
  shareFolder,
  createFolder,
  uploadFileToFolder,
  removeFolderAccess,
  grantRestrictedAccess,
  grantNoDownloadAccess,
} = require("./services/drive");
const app = express();
const port = 8901;

app.use(express.json());

app.post("/giveaccess", async (req, res) => {
  console.log(req.body);
  const { email } = req.body;
  // await uploadFile();
  // await listFiles();
  // await createFolder("test");
  const data = await uploadFileToFolder(
    "send_email.py",
    "1ACHBYO6LOxkkRXuGMc_KOUqT13_4LJqa"
  );
  // await listAllFolders();

  // const data = await shareFolder("1ACHBYO6LOxkkRXuGMc_KOUqT13_4LJqa", email);
  // const data = await grantNoDownloadAccess(
  //   "1Q1pZ8xuSwLheX-LdiuXJfExFd63SeAbC",
  //   email
  // );

  // const data = await removeFolderAccess(
  //   "1ACHBYO6LOxkkRXuGMc_KOUqT13_4LJqa",
  //   email
  // );
  return res.json(data);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
