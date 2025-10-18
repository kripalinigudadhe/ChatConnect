// script.js

// Connect to Socket.IO server
const socket = io("http://localhost:5000");

// DOM elements
const messages = document.getElementById("messages");
const form = document.getElementById("sendForm");
const input = document.getElementById("messageInput");
const statusText = document.getElementById("statusText");
const dot = document.querySelector(".dot");

// Ask user for a name
let username = prompt("Enter your username") || "Anonymous";
let room = "general"; // default room

// Update status
statusText.textContent = "Connected";
dot.style.backgroundColor = "green";

// Join default room
socket.emit("join", { room, username });

// Listen for system messages
socket.on("system", (data) => {
  const li = document.createElement("li");
  li.className = "system";
  li.textContent = data.message;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// Listen for chat messages
socket.on("new_message", (data) => {
  const li = document.createElement("li");
  li.innerHTML = `<b>${data.username}:</b> ${data.content}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// Handle sending messages
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const content = input.value.trim();
  if (!content) return;

  // Emit message to server
  socket.emit("send_message", { room, username, content });

  // Optional: show message instantly on sender's screen
  // const li = document.createElement("li");
  // li.innerHTML = `<b>${username}:</b> ${content}`;
  // messages.appendChild(li);
  // messages.scrollTop = messages.scrollHeight;

  input.value = "";
});
