// Use fetch to send requests to your backend (for login, signup, and chatting).
function demoChat() {
  let inputText = document.getElementById("demo-input").value;
  let demoChatbox = document.querySelector(".demo-chatbox");

  if (inputText) {
    demoChatbox.innerHTML += `<p><strong>You:</strong> ${inputText}</p>`;
    demoChatbox.innerHTML += `<p><strong>Zork AI:</strong> I'm just a demo, but I'm learning every day!</p>`;
    document.getElementById("demo-input").value = "";
  }
}

async function chatWithBot() {
  const userInput = document.getElementById("user-input").value;
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userInput, userId: "user123" }), // Use actual userId
  });
  const data = await response.json();
  document.getElementById("bot-response").textContent = data.response;
}
