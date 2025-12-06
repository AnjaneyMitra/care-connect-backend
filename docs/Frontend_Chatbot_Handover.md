# Frontend Integration Guide: AI Chatbot

## Overview
We have implemented a new AI-powered chatbot backend using Google Gemini. This chatbot is context-aware and can answer questions about the Care Connect platform, user roles, and features.

## API Endpoint

**URL**: `/ai/chat`
**Method**: `POST`
**Content-Type**: `application/json`

### Request Body
```json
{
  "message": "User's question goes here"
}
```

### Response Body
The API returns the raw text response from the AI.

```text
Hello! I can help you with that. To book a nanny...
```

### Error Handling
If the AI service is unavailable or encounters an error, the API will return a 201 Created status (default for NestJS POST) but with a fallback message:
> "I'm having trouble processing your request right now. Please try again."

## Integration Example (React/Next.js)

You can use the following helper function to interact with the chatbot:

```typescript
// services/ai.service.ts

export const sendChatMessage = async (message: string): Promise<string> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    // The backend returns the text directly
    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Chatbot Error:', error);
    return "Sorry, I couldn't reach the server. Please check your connection.";
  }
};
```

## UI Recommendations
1.  **Floating Action Button (FAB)**: Add a chat icon in the bottom-right corner of the app.
2.  **Chat Window**: When clicked, open a small chat window (popover or slide-over).
3.  **Typing Indicator**: Show a loading state while waiting for the API response.
4.  **Message Bubbles**:
    *   User messages: Right-aligned, distinct color.
    *   AI messages: Left-aligned, neutral color.
5.  **Markdown Support**: The AI may return markdown formatting (bolding, lists). Ensure the message component can render basic markdown.

## Testing
You can test the endpoint locally using curl:
```bash
curl -X POST http://localhost:4000/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "How do I find a nanny?"}'
```
