import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const UNSPLASH_API_KEY = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY

    if (!UNSPLASH_API_KEY) {
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 })
    }

    const encodedPrompt = encodeURIComponent(prompt.trim())
    const apiUrl = `https://api.unsplash.com/photos/random?query=${encodedPrompt}`

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
        "Accept-Version": "v1",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API error response:", errorText)
      return NextResponse.json({ error: `API error: ${response.statusText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ url: data.urls?.regular || null })
  } catch (error) {
    console.error("Image generation error:", error)
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
