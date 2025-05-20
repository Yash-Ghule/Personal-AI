import { NextResponse } from "next/server"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid messages format:", messages)
      return NextResponse.json(
        { error: "Invalid messages format. Messages must be a non-empty array." },
        { status: 400 },
      )
    }

    // Validate each message has role and content
    for (const message of messages) {
      if (!message.role || !message.content || typeof message.content !== "string") {
        console.error("Invalid message format:", message)
        return NextResponse.json({ error: "Each message must have a role and content string." }, { status: 400 })
      }
    }

    console.log("Processing messages:", JSON.stringify(messages))

    // GROQ API endpoint
    const url = "https://api.groq.com/openai/v1/chat/completions"

    // Get API key from environment variable
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      console.error("GROQ API key not configured")
      return NextResponse.json({ error: "GROQ API key not configured" }, { status: 500 })
    }

    console.log("Sending request to GROQ API...")

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // You can change this to another GROQ model
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error from GROQ API:", errorText)
      return NextResponse.json({ error: `Error from GROQ API: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected response format from GROQ API:", data)
      return NextResponse.json({ error: "Unexpected response format from GROQ API" }, { status: 500 })
    }

    return NextResponse.json({
      content: data.choices[0].message.content,
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
  }
}
