import { NextRequest, NextResponse } from 'next/server';

// API endpoint to receive processed documents from n8n workflow
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.LOKAI_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    const { title, content, type, source } = data;
    if (!title || !content || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, content, type' 
      }, { status: 400 });
    }

    // Structure document data
    const documentData = {
      id: data.id || Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      type: type.trim(),
      source: source || 'upload',
      url: data.url || null,
      city: data.city || 'general',
      language: data.language || 'en',
      uploadedAt: data.uploadedAt || new Date().toISOString(),
      processedAt: new Date().toISOString(),
      status: 'processed',
      fileSize: data.fileSize || null,
      pageCount: data.pageCount || null,
      
      // Analysis results
      analysis: {
        civicRelevance: data.analysis?.civicRelevance || 'unknown',
        legalComplexity: data.analysis?.legalComplexity || 'medium',
        actionRequired: data.analysis?.actionRequired || false,
        deadline: data.analysis?.deadline || null,
        relatedLaws: data.analysis?.relatedLaws || [],
        keyEntities: data.analysis?.keyEntities || [],
        summary: data.analysis?.summary || '',
        confidence: data.analysis?.confidence || 0.5,
        urgency: 'low' as string
      },
      
      // Extracted metadata
      metadata: {
        documentNumber: data.metadata?.documentNumber || null,
        issueDate: data.metadata?.issueDate || null,
        authority: data.metadata?.authority || null,
        department: data.metadata?.department || null,
        category: data.metadata?.category || null,
        keywords: extractDocumentKeywords(title, content),
        tags: data.metadata?.tags || []
      }
    };

    // Determine document urgency
    const urgency = calculateDocumentUrgency(documentData);
    documentData.analysis.urgency = urgency;

    // TODO: Save to database when db setup is working
    // await saveDocumentToDatabase(documentData);

    console.log('New document processed:', {
      title: documentData.title,
      type: documentData.type,
      source: documentData.source,
      civicRelevance: documentData.analysis.civicRelevance,
      urgency: urgency
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Document received and processed',
      id: documentData.id,
      type: documentData.type,
      civicRelevance: documentData.analysis.civicRelevance,
      urgency: urgency,
      summary: documentData.analysis.summary
    });

  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET endpoint to retrieve documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: Implement database query when db is ready
    // For now, return mock data structure
    const mockDocuments = [
      {
        id: "1",
        title: "RTI Application Form Guidelines",
        type: "policy",
        source: "government",
        city: "Delhi",
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        analysis: {
          civicRelevance: "high",
          urgency: "medium",
          summary: "Guidelines for filing RTI applications in Delhi"
        }
      },
      {
        id: "2",
        title: "Municipal Property Tax Notice",
        type: "notice",
        source: "municipal",
        city: "Mumbai",
        uploadedAt: new Date(Date.now() - 172800000).toISOString(),
        analysis: {
          civicRelevance: "high",
          urgency: "high",
          summary: "Property tax payment notice for fiscal year 2025-26"
        }
      }
    ];

    let filteredDocuments = mockDocuments;
    
    if (type) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.type === type.toLowerCase()
      );
    }
    
    if (city) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.city.toLowerCase() === city.toLowerCase()
      );
    }
    
    if (source) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.source === source.toLowerCase()
      );
    }

    // Apply limit
    filteredDocuments = filteredDocuments.slice(0, limit);

    return NextResponse.json({
      success: true,
      documents: filteredDocuments,
      count: filteredDocuments.length
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

function extractDocumentKeywords(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase();
  const keywords: string[] = [];
  
  // Legal keywords
  const legalTerms = ['act', 'law', 'regulation', 'policy', 'guideline', 'rule', 'order', 'notification', 'circular'];
  const civicTerms = ['municipal', 'citizen', 'public', 'civic', 'urban', 'tax', 'property', 'service'];
  const documentTypes = ['application', 'form', 'notice', 'certificate', 'license', 'permit'];
  
  [...legalTerms, ...civicTerms, ...documentTypes].forEach(term => {
    if (text.includes(term)) {
      keywords.push(term);
    }
  });
  
  return [...new Set(keywords)]; // Remove duplicates
}

function calculateDocumentUrgency(document: any): string {
  let urgencyScore = 0;
  
  // Check for deadline-related keywords
  const urgentKeywords = ['deadline', 'urgent', 'immediate', 'within', 'days', 'expires'];
  const content = `${document.title} ${document.content}`.toLowerCase();
  
  urgentKeywords.forEach(keyword => {
    if (content.includes(keyword)) urgencyScore += 1;
  });
  
  // Check document type
  const urgentTypes = ['notice', 'summons', 'penalty', 'fine'];
  if (urgentTypes.includes(document.type.toLowerCase())) {
    urgencyScore += 2;
  }
  
  // Check if action required
  if (document.analysis?.actionRequired) {
    urgencyScore += 2;
  }
  
  // Check if deadline exists
  if (document.analysis?.deadline) {
    const deadline = new Date(document.analysis.deadline);
    const now = new Date();
    const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysUntilDeadline <= 7) urgencyScore += 3;
    else if (daysUntilDeadline <= 30) urgencyScore += 1;
  }
  
  // Determine urgency level
  if (urgencyScore >= 5) return 'high';
  if (urgencyScore >= 3) return 'medium';
  return 'low';
}