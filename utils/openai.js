const request = require("request");

const url =
  "https://openai-dev-pg.openai.azure.com/openai/deployments/gpt-35-turbo-base/chat/completions";
const apiVersion = "2023-03-15-preview";
const apiKey = "e069e91a4a434d8c9128fcd82b8bd857";

const endPoint =
  url +
  "?api-version=" +
  apiVersion +
  "&api-key=" +
  apiKey +
  "&Content-Type=application/json";

const getResponse = (prompt, callback) => {
  var options = {
    method: "POST",
    url: endPoint,
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: prompt.systemMessage,
        },
        {
          role: "user",
          content: prompt.userMessage,
        },
      ],
      temperature: 0,
    }),
  };
  request(options, function (error, response) {
    if (error) {
      callback("Error Occurred in getting the response");
    } else {
      let jsonResponse = JSON.parse(response.body);
      if (jsonResponse.error) callback(jsonResponse.error.message);
      else callback(jsonResponse.choices[0].message.content);
    }
  });
};

module.exports = {
  getResponse: getResponse,
};
