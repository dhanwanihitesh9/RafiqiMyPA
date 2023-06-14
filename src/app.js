const express = require("express");
const https = require("https");
const path = require("path");
const hbs = require("hbs");
const fs = require("fs");
const multer = require("multer");
const document = require("../utils/document.js");
const openai = require("../utils/openai.js");
const pdf = require("pdf-parse");

//certificate configuration
var privateKey = fs.readFileSync(path.join(__dirname, "../cert/key.pem"));
var certificate = fs.readFileSync(path.join(__dirname, "../cert/cert.pem"));
var credentials = { key: privateKey, cert: certificate };

//hbs configurations
const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

//server initialization and param setup
const app = express();
const port = process.env.PORT || 3000;

//set up handlebars engine and views location
hbs.registerPartials(partialsPath);
app.use(express.static(publicDirectoryPath));
app.set("view engine", "hbs");
app.set("views", viewsPath);

// Define the storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original file name=>
  },
});

// Create the multer upload instance
const upload = multer({ storage: storage });

//renders th admin page
app.get("/admin", (req, res) => {
  document.retrieveList((response) => {
    res.render("admin", response);
  });
});

//method to upload a file
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(500).send("File upload failed!");
  } else {
    document.saveDocument(req, (response) => {
      res.status(200).send(response);
    });
  }
});

//method to delete a file
app.get("/delete/:fileName", (req, res) => {
  const filePath = "/uploads/" + fileName;

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file: ${err}`);
      return;
    }
    console.log("File deleted successfully.");
  });
});

//renders chat page
app.get("/chat", (req, res) => {
  document.retrieveList((response) => {
    res.render("chat", response);
  });
});

//call gpt
app.get("/ask", (req, res) => {
  let queryTopic = req.query.topic;
  if (queryTopic != null || queryTopic != "undefined" || queryTopic != "") {
    document.readFile(queryTopic, (response, responseStatus) => {
      if (responseStatus === 200) {
        let newPrompt = {
          systemMessage:
            "This information is on topic : " +
            req.query.topic +
            " You will be provided with customer service queries. The customer service query will be delimited with \
          #### characters. You have to provide an answer to the user by referring to the information as follows. Please also validate the response and let the user now the line referred while answering the question - " +
            response,
          userMessage: "####" + req.query.prompt + "###",
        };
        //call open ai with new prompt
        openai.getResponse(newPrompt, (response) => {
          res.status(200).send(response);
        });
      } else {
        openai.getResponse(req.query.prompt, (response) => {
          res.status(201).send(response);
        });
      }
    });
  }
});

app.get("/test", (req, res) => {
  let messagePost = req.query.messagePost;

  if (messagePost != null && messagePost != "undefined" && messagePost != "") {
    let newPrompt = {
      systemMessage:
        "Given is a message to be posted on twitter. The user message is delimited by #### Please check if this is a professional tone and respond only as true or false please respond the answer only in true or false without any explanations",
      userMessage: "####" + messagePost + "####",
    };
    openai.getResponse(newPrompt, (response) => {
      let charLength = messagePost.length;
      let newResponse = {
        isProfessional: response,
        charLength: charLength,
      };
      if (response.toLowerCase().includes("false")) {
        //convert to professional tone
        let newPrompt3 = {
          systemMessage:
            "Convert the given message to professional tone. The converted message length must not exceed 400 characters strictly. Also recommend relevant hashtags for it. The user message is delimited by ####. Please respond in json format as follows { text: newMessage, hashtags: 3 hashtag comma seperated}",
          userMessage: "####" + messagePost + "####",
        };
        openai.getResponse(newPrompt3, (response) => {
          res.status(200).send(response);
        });
      } else {
        if (charLength < 400) {
          res.status(200).send(newResponse);
        } else {
          let newPrompt2 = {
            systemMessage:
              "Reduce the user message to 400 characters keeping the tone professional. Also recommend relevant hashtags for it. The user message is delimited by ####. Please respond in json format as follows { text: newMessage, hashtags: 3 hashtag comma seperated}",
            userMessage: "####" + messagePost + "####",
          };
          openai.getResponse(newPrompt2, (response) => {
            res.status(200).send(response);
          });
        }
      }
    });
  } else res.status(404).send();
});

app.get("/tncCheck", (req, res) => {
  const pdfPath = path.join(
    __dirname,
    "..",
    "uploads",
    "GeneralTermsAndConditions.pdf"
  );

  let dataBuffer = fs.readFileSync(pdfPath);

  pdf(dataBuffer).then(function (data) {
    // number of pages
    console.log(data.numpages);
    // number of rendered pages
    console.log(data.numrender);
    // PDF info
    console.log(data.info);
    // PDF metadata
    console.log(data.metadata);
    // PDF.js version
    // check https://mozilla.github.io/pdf.js/getting_started/
    console.log(data.version);
    // PDF text
    console.log(data.text);
  });
});

var server = https.createServer(credentials, app);

server.listen(port, () => {
  console.log("Server is up on port " + port);
});
