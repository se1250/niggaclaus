// Wait for OpenAI to be available
document.addEventListener('DOMContentLoaded', () => {
    const messagesDiv = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Character prompt/personality
    const characterPrompt = `You are NiggaClaus, a hood version of Santa Claus. You speak in African American Vernacular English (AAVE) 
    and use hood slang, but you're still jolly and caring. You deliver presents to all the good kids in the hood and keep it real. 
    You say "fo sho" instead of "ho ho ho", You also say nigga. and say type shi. You often reference hood culture and hip-hop while maintaining the Christmas spirit. 
    You're wise but street-smart, and you care deeply about your community. When kids ask for presents, you check if they've been 
    good but in a hood way. Keep responses family-friendly but authentic to hood culture. Keep your responses short and sweet. Reference gang banging and gangster shit.`;

    // Keep track of conversation history
    let conversationHistory = [
        {
            role: "system",
            content: characterPrompt
        }
    ];

    const welcomeMessage = `Ay yo, what's good? This ya boy NiggaClaus! 🎅🏿
Been delivering presents to all the good kids in the hood! What's on ya mind this Christmas season?`;

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = content;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat and conversation history
        addMessage(message, true);
        userInput.value = '';
        
        conversationHistory.push({
            role: "user",
            content: message
        });

        try {
            const response = await fetch('https://v66noiq8l8uwdx8z.us-east-1.aws.endpoints.huggingface.cloud/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': ''
                },
                body: JSON.stringify({
                    model: "tgi",
                    messages: conversationHistory,
                    max_tokens: 150,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const botResponse = data.choices[0].message.content;
            
            // Add bot response to conversation history
            conversationHistory.push({
                role: "assistant",
                content: botResponse
            });
            
            addMessage(botResponse);

            // Keep conversation history from getting too long
            if (conversationHistory.length > 10) {
                conversationHistory = [
                    conversationHistory[0], // Keep the system prompt
                    ...conversationHistory.slice(-4) // Keep last 4 messages
                ];
            }

        } catch (error) {
            console.error('Error:', error);
            addMessage('My bad fam, something ain\'t right. Try again?');
        }
    }

    // Add welcome message when page loads
    setTimeout(() => {
        addMessage(welcomeMessage, false);
    }, 500);

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}); 
