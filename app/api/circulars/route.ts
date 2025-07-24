import { NextRequest, NextResponse } from 'next/server';

// API endpoint to receive government circulars from n8n workflow
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.LOKAI_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    const { title, content, source, sourceUrl, publishedAt, category } = data;
    if (!title || !content || !source) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, content, source' 
      }, { status: 400 });
    }

    // In a full implementation, save to database
    // For now, we'll structure the data and return success
    const circularData = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      source,
      sourceUrl: sourceUrl || '',
      publishedAt: publishedAt || new Date().toISOString(),
      category: category || 'government',
      extractedAt: data.extractedAt || new Date().toISOString(),
      status: 'active',
      relevanceScore: calculateRelevanceScore(title, content),
      keywords: extractKeywords(title + ' ' + content)
    };

    // TODO: Save to database when db setup is working
    // await saveCircularToDatabase(circularData);

    console.log('New circular received:', {
      title: circularData.title,
      source: circularData.source,
      category: circularData.category,
      relevanceScore: circularData.relevanceScore
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Circular received and processed',
      id: circularData.id,
      relevanceScore: circularData.relevanceScore
    });

  } catch (error) {
    console.error('Error processing circular:', error);
    return NextResponse.json({ 
      error: 'Failed to process circular' 
    }, { status: 500 });
  }
}

// Calculate relevance score based on civic keywords
function calculateRelevanceScore(title: string, content: string): number {
  const text = (title + ' ' + content).toLowerCase();
  const civicKeywords = [
    'citizen', 'public', 'municipal', 'civic', 'urban', 'city', 'town', 
    'village', 'panchayat', 'local government', 'administration', 'policy',
    'service', 'welfare', 'development', 'infrastructure', 'transport',
    'health', 'education', 'safety', 'environment', 'water', 'electricity'
  ];
  
  let score = 0;
  civicKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += keyword.length > 6 ? 2 : 1; // Longer keywords get higher weight
    }
  });
  
  // Normalize score to 0-100
  return Math.min(100, Math.round((score / civicKeywords.length) * 100));
}

// Extract relevant keywords from text
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const stopWords = ['that', 'with', 'have', 'this', 'will', 'from', 'they', 'been', 'their', 'said', 'each', 'which'];
  const keywords = words.filter(word => !stopWords.includes(word));
  
  // Get unique keywords and limit to top 10
  return [...new Set(keywords)].slice(0, 10);
}

const mockCirculars = [
  {
    id: 1,
    title: "New Property Tax Assessment Guidelines 2025",
    city: "Mumbai",
    date: "2025-01-20",
    source: "Municipal Corporation of Greater Mumbai",
    sourceLink: "https://portal.mcgm.gov.in",
    category: "Tax",
    summary:
      "Updated property tax calculation methods with new rates for residential and commercial properties. Key changes include revised area calculations and exemption criteria for senior citizens.",
    priority: "high",
  },
  {
    id: 5,
    title: "Street Vendor License Renewal Process",
    city: "Kolkata",
    date: "2025-01-16",
    source: "Kolkata Municipal Corporation",
    sourceLink: "https://www.kmcgov.in",
    category: "Business",
    summary:
      "Simplified online process for street vendor license renewal. New guidelines for designated vending zones and compliance requirements.",
    priority: "medium",
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  let circulars = mockCirculars;

  if (city) {
    circulars = circulars.filter((c) => c.city === city);
  }

  if (category) {
    circulars = circulars.filter((c) => c.category === category);
  }

  if (q) {
    circulars = circulars.filter(
      (c) =>
        c.title.toLowerCase().includes(q.toLowerCase()) ||
        c.summary.toLowerCase().includes(q.toLowerCase())
    );
  }

  return NextResponse.json({
    success: true,
    data: circulars,
  });
}
