import { NextRequest, NextResponse } from 'next/server';

// API endpoint to receive city alerts from n8n workflow
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.LOKAI_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    const { title, description, city, severity, type, source } = data;
    if (!title || !city || !severity) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, city, severity' 
      }, { status: 400 });
    }

    // Validate severity levels
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity.toLowerCase())) {
      return NextResponse.json({ 
        error: 'Invalid severity level. Must be: low, medium, high, critical' 
      }, { status: 400 });
    }

    // Structure alert data
    const alertData = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description?.trim() || '',
      city: city.trim(),
      severity: severity.toLowerCase(),
      type: type || 'general',
      source: source || 'monitoring',
      isActive: true,
      publishedAt: data.publishedAt || new Date().toISOString(),
      extractedAt: data.extractedAt || new Date().toISOString(),
      location: data.location || null,
      affectedAreas: data.affectedAreas || [],
      actionRequired: data.actionRequired || false,
      estimatedDuration: data.estimatedDuration || null,
      contactInfo: data.contactInfo || null,
      tags: extractAlertTags(title, description, type)
    };

    // Handle urgent alerts (high/critical severity)
    if (['high', 'critical'].includes(alertData.severity)) {
      // TODO: Implement urgent notification system
      console.log('🚨 URGENT ALERT:', {
        city: alertData.city,
        title: alertData.title,
        severity: alertData.severity
      });
    }

    // TODO: Save to database when db setup is working
    // await saveAlertToDatabase(alertData);

    console.log('New alert received:', {
      city: alertData.city,
      title: alertData.title,
      severity: alertData.severity,
      type: alertData.type
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Alert received and processed',
      id: alertData.id,
      severity: alertData.severity,
      urgent: ['high', 'critical'].includes(alertData.severity)
    });

  } catch (error) {
    console.error('Error processing alert:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET endpoint to retrieve alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const severity = searchParams.get('severity');
    const active = searchParams.get('active') !== 'false';

    // TODO: Implement database query when db is ready
    // For now, return mock data structure
    const mockAlerts = [
      {
        id: "1",
        title: "Traffic Disruption on Ring Road",
        description: "Major traffic disruption due to road construction",
        city: "Delhi",
        severity: "medium",
        type: "traffic",
        isActive: true,
        publishedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "2", 
        title: "Water Supply Interruption",
        description: "Scheduled water supply maintenance",
        city: "Mumbai",
        severity: "high",
        type: "utility",
        isActive: true,
        publishedAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    let filteredAlerts = mockAlerts;
    
    if (city) {
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.city.toLowerCase() === city.toLowerCase()
      );
    }
    
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.severity === severity.toLowerCase()
      );
    }
    
    if (active) {
      filteredAlerts = filteredAlerts.filter(alert => alert.isActive);
    }

    return NextResponse.json({
      success: true,
      alerts: filteredAlerts,
      count: filteredAlerts.length
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

function extractAlertTags(title: string, description: string, type: string): string[] {
  const content = `${title} ${description}`.toLowerCase();
  const tags = [];
  
  // Emergency keywords
  if (content.includes('emergency') || content.includes('urgent')) tags.push('emergency');
  if (content.includes('traffic') || content.includes('road')) tags.push('traffic');
  if (content.includes('water') || content.includes('supply')) tags.push('utility');
  if (content.includes('power') || content.includes('electricity')) tags.push('power');
  if (content.includes('weather') || content.includes('rain')) tags.push('weather');
  if (content.includes('safety') || content.includes('security')) tags.push('safety');
  if (content.includes('health') || content.includes('medical')) tags.push('health');
  
  // Add type as tag
  if (type) tags.push(type);
  
  return [...new Set(tags)]; // Remove duplicates
}