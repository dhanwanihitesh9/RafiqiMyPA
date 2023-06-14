// Button element
var uploadButton = document.getElementById("file-upload");

// Event listener for button click, hello
uploadButton.addEventListener("click", handleFileUpload);

// Function to handle file upload
function handleFileUpload() {
  var fileInput = document.getElementById("docFile");
  var file = fileInput.files[0];

  // Create a FormData object
  var formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", document.getElementById("docName").value);
  formData.append("fileDescription", document.getElementById("docDesc").value);
  formData.append("fileType", document.getElementById("docType").value);
  formData.append("fileDisplayName", document.getElementById("docName").value);

  // Make an HTTP request using fetch
  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        console.log("File uploaded successfully!");
      } else {
        console.error("Error uploading file.");
      }
    })
    .catch((error) => {
      console.error("Error uploading file:", error);
    });
}

function deleteFile() {
  var http = new XMLHttpRequest();
  http.open("GET", "/delete/" + fileName, true);
  http.onreadystatechange = function () {
    if (http.readyState === 4 && http.status === 200 && http.responseText) {
      retrieveCapacity();
      alert(className + " bin cleared !!!");
    }
  };
  // Send request
  http.send();
}
