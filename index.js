const express = require("express");
const path = require("path");
const {
  listFiles,
  uploadFile,
  listAllFolders,
  shareFolder,
  createFolder,
  uploadFileToFolder,
} = require("./services/drive");
const app = express();
const port = 8901;

app.use(express.json());

app.post("/giveaccess", async (req, res) => {
  console.log(req.body);
  const { email } = req.body;
  // await uploadFile();
  await listFiles();
  // await createFolder("test");
  // await uploadFileToFolder();
  await listAllFolders();

  const data = await shareFolder("1gCkM9XESgYfTPCts3aOMWLBiuVx20AF_", email);
  return res.json(data);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
