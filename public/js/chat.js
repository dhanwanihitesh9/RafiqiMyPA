const synth = window.speechSynthesis;

function voiceControl(string) {
  let u = new SpeechSynthesisUtterance(string);
  u.text = string;
  u.lang = "en-aus";
  u.volume = 1;
  u.rate = 1;
  u.pitch = 1;
  synth.speak(u);
}

function sendMessage() {
  const inputField = document.getElementById("input");
  let inputTopic = document.getElementsByClassName("label-desc")[0].innerHTML;

  let input = inputField.value.trim();
  input != "" && output(input, inputTopic);
  inputField.value = "";
}
document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.getElementById("input");

  inputField.addEventListener("keydown", function (e) {
    if (e.code === "Enter") {
      let input = inputField.value.trim();
      let inputTopic =
        document.getElementsByClassName("label-desc")[0].innerHTML;
      input != "" && output(input, inputTopic);
      inputField.value = "";
    }
  });
});

function output(input, inputTopic) {
  let product;

  let text = input.toLowerCase().replace(/[^\w\s\d]/gi, "");
  text = text
    .replace(/[\W_]/g, " ")
    .replace(/ a /g, " ")
    .replace(/i feel /g, "")
    .replace(/whats/g, "what is")
    .replace(/please /g, "")
    .replace(/ please/g, "")
    .trim();

  //call gpt here
  var http = new XMLHttpRequest();
  http.open("GET", "ask?prompt=" + text + "&topic=" + inputTopic, true);
  http.onreadystatechange = function () {
    if (http.readyState === 4 && http.status === 200 && http.responseText) {
      addChat(input, http.responseText);
    } else if (http.readyState === 4 && http.status === 201) {
      addChat(
        input,
        http.responseText +
          " \n I will be able to respond precisely if a topic is selected."
      );
    }
  };
  // Send request
  http.send();
}

function addChat(input, product) {
  const mainDiv = document.getElementById("message-section");
  let userDiv = document.createElement("div");
  userDiv.id = "user";
  userDiv.classList.add("message");
  userDiv.innerHTML = `<span id="user-response">${input}</span>`;
  mainDiv.appendChild(userDiv);

  let botDiv = document.createElement("div");
  botDiv.id = "bot";
  botDiv.classList.add("message");
  botDiv.innerHTML = `<span id="bot-response">${product}</span>`;
  mainDiv.appendChild(botDiv);
  var scroll = document.getElementById("message-section");
  scroll.scrollTop = scroll.scrollHeight;
  //voiceControl(product);
}

$("select").on("click", function () {
  $(this).parent(".select-box").toggleClass("open");
});

$(document).mouseup(function (e) {
  var container = $(".select-box");

  if (container.has(e.target).length === 0) {
    container.removeClass("open");
  }
});

$("select").on("change", function () {
  var selection = $(this).find("option:selected").text(),
    labelFor = $(this).attr("id"),
    label = $("[for='" + labelFor + "']");

  label.find(".label-desc").html(selection);
});
