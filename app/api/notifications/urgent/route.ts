import { NextRequest, NextResponse } from 'next/server';

// API endpoint to receive urgent notifications from n8n workflow
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.LOKAI_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    const { title, message, priority, type, source } = data;
    if (!title || !message || !priority) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, message, priority' 
      }, { status: 400 });
    }

    // Validate priority levels
    const validPriorities = ['low', 'medium', 'high', 'critical', 'emergency'];
    if (!validPriorities.includes(priority.toLowerCase())) {
      return NextResponse.json({ 
        error: 'Invalid priority level. Must be: low, medium, high, critical, emergency' 
      }, { status: 400 });
    }

    // Structure notification data
    const notificationData = {
      id: Date.now().toString(),
      title: title.trim(),
      message: message.trim(),
      priority: priority.toLowerCase(),
      type: type || 'alert',
      source: source || 'system',
      isUrgent: ['high', 'critical', 'emergency'].includes(priority.toLowerCase()),
      createdAt: new Date().toISOString(),
      expiresAt: data.expiresAt || null,
      
      // Additional metadata
      city: data.city || 'general',
      affectedAreas: data.affectedAreas || [],
      actionRequired: data.actionRequired || false,
      contactInfo: data.contactInfo || null,
      relatedLinks: data.relatedLinks || [],
      
      // Delivery status
      status: 'active',
      deliveryMethod: data.deliveryMethod || ['web'],
      sentAt: new Date().toISOString(),
      acknowledgedAt: null
    };

    // Handle different notification types
    switch (notificationData.type) {
      case 'emergency':
        notificationData.priority = 'emergency';
        console.log('🚨 EMERGENCY NOTIFICATION:', notificationData.title);
        break;
      case 'alert':
        console.log('⚠️ URGENT ALERT:', notificationData.title);
        break;
      case 'update':
        console.log('📢 URGENT UPDATE:', notificationData.title);
        break;
      default:
        console.log('📣 URGENT NOTIFICATION:', notificationData.title);
    }

    // TODO: Implement actual notification delivery system
    // This could include:
    // - Push notifications
    // - Email alerts
    // - SMS for critical notifications
    // - WebSocket real-time updates
    // - Integration with notification services

    // For emergency/critical notifications, trigger immediate alerts
    if (['emergency', 'critical'].includes(notificationData.priority)) {
      // TODO: Trigger immediate notification channels
      console.log('🚨 CRITICAL ALERT - Immediate action required:', {
        title: notificationData.title,
        priority: notificationData.priority,
        city: notificationData.city,
        actionRequired: notificationData.actionRequired
      });
    }

    // TODO: Save to database when db setup is working
    // await saveNotificationToDatabase(notificationData);

    return NextResponse.json({ 
      success: true, 
      message: 'Urgent notification received and processed',
      id: notificationData.id,
      priority: notificationData.priority,
      isUrgent: notificationData.isUrgent,
      deliveryMethod: notificationData.deliveryMethod
    });

  } catch (error) {
    console.error('Error processing urgent notification:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET endpoint to retrieve urgent notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const priority = searchParams.get('priority');
    const active = searchParams.get('active') !== 'false';
    const limit = parseInt(searchParams.get('limit') || '20');

    // TODO: Implement database query when db is ready
    // For now, return mock urgent notifications
    const mockNotifications = [
      {
        id: "1",
        title: "Emergency: Water Supply Critical Failure",
        message: "Critical water supply failure in Central Delhi. Immediate action required.",
        priority: "emergency",
        type: "emergency",
        city: "Delhi",
        isUrgent: true,
        createdAt: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        actionRequired: true
      },
      {
        id: "2",
        title: "High Alert: Traffic Disruption on Highway",
        message: "Major traffic disruption on Mumbai-Pune highway due to accident.",
        priority: "high",
        type: "alert",
        city: "Mumbai",
        isUrgent: true,
        createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        actionRequired: false
      }
    ];

    let filteredNotifications = mockNotifications;
    
    if (city) {
      filteredNotifications = filteredNotifications.filter(notification => 
        notification.city.toLowerCase() === city.toLowerCase()
      );
    }
    
    if (priority) {
      filteredNotifications = filteredNotifications.filter(notification => 
        notification.priority === priority.toLowerCase()
      );
    }
    
    if (active) {
      // Only return recent notifications (last 24 hours)
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      filteredNotifications = filteredNotifications.filter(notification => 
        new Date(notification.createdAt) > dayAgo
      );
    }

    // Apply limit
    filteredNotifications = filteredNotifications.slice(0, limit);

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications,
      count: filteredNotifications.length,
      urgentCount: filteredNotifications.filter(n => n.isUrgent).length
    });

  } catch (error) {
    console.error('Error fetching urgent notifications:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}