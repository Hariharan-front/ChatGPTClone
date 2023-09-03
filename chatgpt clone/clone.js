const chatInput=document.querySelector("#chat-input");
const sendButton=document.querySelector("#send-btn");
const chatContainer=document.querySelector(".chat-container");
const themeButton=document.querySelector("#theme-btn");
const deleteButton=document.querySelector("#delete-btn");

let userText=null;
const API_KEY="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";
const initialHeight=chatInput.scrollHeight;

const localDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("theme-color");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>ChatGPT Clone</h1>
                            <p>Start a conversation and explore the power of AI.<br> Your chatHistory will be displayed here!!</p>
                        </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    // chatContainer.scrollTo(0, chatContainer.scrollHeight);  <-- Remove this line
}

localDataFromLocalstorage();

const deleteMessages = () => {
    if (confirm("Are you sure you want to delete the selected messages?")) {
        const selectedChats = chatContainer.querySelectorAll(".chat.selected");
        const deletedMessages = [];
        
        selectedChats.forEach(chat => {
            const chatContent = chat.querySelector(".chat-details p").textContent;
            deletedMessages.push(chatContent);
            chat.remove();
        });

        storeDeletedMessages(deletedMessages);
        updateSidebar();
        localStorage.setItem("all-chats", chatContainer.innerHTML);
    }
};

// Function to toggle the sidebar
const toggleSidebar = () => {
    sidebar.classList.toggle("sidebar-hidden");
    chatContainer.classList.toggle("full-width");
};


const storeDeletedMessages = (messages) => {
    const deletedMessages = localStorage.getItem("deleted-messages");
    const storedMessages = deletedMessages ? JSON.parse(deletedMessages) : [];
    storedMessages.push(messages);
    localStorage.setItem("deleted-messages", JSON.stringify(storedMessages));
};


const sideBarContainer=document.querySelector(".sidebar");


const createElement=(html, className) => {
    const chatDiv=document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML=html;
    return chatDiv;
}

const getChatResponse =async (incomingChatDiv) => {
    const API_URL="https://api.openai.com/v1/completions";
    const pElement=document.createElement("p");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null
        })
    }

    try {
        const response=await(await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
    } catch(error) {
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
}

const copyResponse = (copyBtn) => {
    //copy the text content of the response to clipboard
    const responseTextElement=copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent="done";
    setTimeout(() => copyBtn.textContent="content_copy", 1000);
}

const showTypingAnimation = () => {
    const html=`<div class="chat-content">
                 <div class="chat-details">
                     <img src="images/chatbot.jpg" alt="bot-img">
                    <div class="typing-animation">
                     <div class="typing-dot" style="--delay: 0.2s"></div>
                     <div class="typing-dot" style="--delay: 0.3s"></div>
                     <div class="typing-dot" style="--delay: 0.4s"></div>
                    </div>
                 </div>
                 <span onclick="copyResponse(this)" class="material-symbols-outlined">content_copy</span>
                </div>`
    const incomingChatDiv=createElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat=() => {
    userText=chatInput.value.trim();
    if(!userText) {
        return;
    }
    chatInput.value="";
    chatInput.style.height=`${initialHeight}px`;

    const html=` <div class="chat-content">
                  <div class="chat-details">
                      <img src="images/user.jpg" alt="user-img">
                      <p></p>
                  </div>
                 </div>`;
    const outgoingChatDiv=createElement(html, "outgoing");
    outgoingChatDiv.querySelector("p").textContent=userText;
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", themeButton.innerText);
    themeButton.innerText=document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

deleteButton.addEventListener("click", () => {
    if(confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        localDataFromLocalstorage();
    }
})

chatInput.style.height = `${initialHeight}px`;
chatInput.style.height = `${chatInput.scrollHeight}px`;

chatInput.addEventListener("keydown", (e) => {
    //if the enter key is pressed without shift key and window width is larger than 800 pixels
    //handle the outgoing chat
   if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleOutgoingChat();
   }
})

sendButton.addEventListener("click", handleOutgoingChat);

