const path = require("path");
const fs = require("fs");

const jsonPath = path.join(__dirname, "..", "objects", "document.json");
const uploadPath = path.join(__dirname, "..", "uploads");

const saveDocument = (request, callback) => {
  //check if the documen name already exists
  findDocument(request.body.fileDisplayName, (response, responseStatus) => {
    let jsonString = fs.readFileSync(jsonPath, "utf8");
    let jsonData = JSON.parse(jsonString);
    if (responseStatus === 404) {
      //create document records
      let documentData = {
        name: request.file.filename,
        description: request.body.fileDescription,
        type: request.body.fileType,
        size: request.file.size,
        path: request.file.path,
        displayName: request.body.fileDisplayName,
      };
      jsonData.document.push(documentData);

      jsonString = JSON.stringify(jsonData);
      fs.writeFile(jsonPath, jsonString, callback);
    } else {
      callback;
    }
  });
};

const retrieveList = (callback) => {
  var jsonString = fs.readFileSync(jsonPath, "utf8");
  var jsonData = JSON.parse(jsonString);
  callback(jsonData);
};

const findDocument = (displayName, callback) => {
  //find the document
  let jsonString = fs.readFileSync(jsonPath, "utf8");
  let jsonData = JSON.parse(jsonString);
  let documentCount = jsonData.document.length;
  let responseStatus = 404;
  let response = {};
  let x = 0;
  while (x < documentCount) {
    if (jsonData.document[x].displayName === displayName) {
      response = jsonData.document[x];
      responseStatus = 200;
      break;
    }
    x++;
  }
  callback(response, responseStatus);
};

const readFile = (topic, callback) => {
  //find if document exists
  findDocument(topic, (response, responseStatus) => {
    if (responseStatus === 404) {
      callback("", 404);
    } else {
      let filePath = path.join(uploadPath, response.name);
      let fileContent = fs.readFileSync(filePath, "utf8");
      callback(fileContent, 200);
    }
  });
};

module.exports = {
  saveDocument: saveDocument,
  retrieveList: retrieveList,
  findDocument: findDocument,
  readFile: readFile,
};
