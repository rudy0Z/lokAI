import { NextRequest, NextResponse } from 'next/server'
import { analyzeText } from '@/lib/ai'
import pdfParse from 'pdf-parse'

// API route to handle PDF processing server-side
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    // Convert File to Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text from PDF using pdf-parse
    let extractedText = ''
    let pdfInfo = { numpages: 1 }
    
    try {
      const pdfData = await pdfParse(buffer)
      extractedText = pdfData.text
      pdfInfo = pdfData.info || { numpages: 1 }
      
      // Clean up the extracted text
      extractedText = extractedText
        .replace(/\s+/g, ' ') // Replace multiple whitespaces with single space
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim()

      console.log(`PDF processed: ${file.name}, Pages: ${pdfInfo.numpages}, Characters: ${extractedText.length}`)
      
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError)
      // Fallback to a basic message if PDF parsing fails
      extractedText = `Unable to extract text from this PDF file. File: ${file.name}, Size: ${file.size} bytes. The document may be image-based or encrypted.`
    }

    // If no text was extracted, provide a helpful message
    if (!extractedText || extractedText.trim().length < 10) {
      extractedText = `This PDF file (${file.name}) appears to be image-based or contains minimal text. For better analysis, please ensure the PDF contains searchable text content.`
    }

    // Analyze the extracted text using Groq AI
    const analysis = await analyzeText(extractedText)

    const result = {
      text: extractedText,
      analysis,
      metadata: {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        pages: pdfInfo.numpages || 1,
        type: 'PDF',
        textLength: extractedText.length,
        extractionStatus: extractedText.length > 10 ? 'success' : 'limited'
      },
      success: true
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('PDF processing error:', error)
    return NextResponse.json(
      { error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'PDF Processing API',
    endpoint: 'POST /api/process-pdf',
    description: 'Upload and process PDF documents with AI analysis'
  })
}
