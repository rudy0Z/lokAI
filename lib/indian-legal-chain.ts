import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Interface for conversation memory
interface ConversationMemory {
  messages: Array<{ role: "user" | "assistant"; content: string; timestamp: Date }>;
  context: {
    userCity?: string;
    userLanguage?: string;
    documentContext?: any;
    legalTopics?: string[];
  };
}

// Interface for Indian legal knowledge base
interface IndianLegalKnowledge {
  acts: Record<string, any>;
  procedures: Record<string, any>;
  schemes: Record<string, any>;
  contacts: Record<string, any>;
}

// Indian Legal Knowledge Base
const indianLegalKB: IndianLegalKnowledge = {
  acts: {
    "RTI Act 2005": {
      sections: {
        "Section 3": "Right to information",
        "Section 4": "Obligations of public authorities",
        "Section 6": "Request for obtaining information",
        "Section 7": "Disposal of request",
        "Section 18": "Powers and functions of Information Commission"
      },
      procedures: [
        "Submit application with Rs. 10 fee",
        "Specify information required clearly",
        "Provide contact details",
        "Submit to Public Information Officer (PIO)"
      ],
      timelines: "30 days for response, 48 hours for life/liberty issues"
    },
    "Consumer Protection Act 2019": {
      sections: {
        "Section 35": "Jurisdiction of District Commission",
        "Section 58": "Jurisdiction of State Commission", 
        "Section 74": "Jurisdiction of National Commission"
      },
      procedures: [
        "File complaint within 2 years",
        "Pay prescribed fee",
        "Attach supporting documents",
        "Choose appropriate forum based on compensation amount"
      ],
      jurisdiction: {
        "District": "Up to Rs. 1 crore",
        "State": "Rs. 1 crore to Rs. 10 crore", 
        "National": "Above Rs. 10 crore"
      }
    },
    "Income Tax Act 1961": {
      deadlines: {
        "ITR Filing": "July 31 for individuals",
        "Audit Reports": "October 31",
        "Tax Payment": "March 15 for advance tax"
      },
      sections: {
        "Section 80C": "Deductions up to Rs. 1.5 lakh",
        "Section 80D": "Medical insurance deductions",
        "Section 234A": "Interest for delay in filing return"
      }
    }
  },
  procedures: {
    "Aadhaar Correction": {
      documents: ["Proof of Identity", "Proof of Address", "Proof of Date of Birth"],
      process: [
        "Visit nearest Aadhaar center",
        "Fill Aadhaar correction form",
        "Submit supporting documents",
        "Pay Rs. 50 fee for demographic updates",
        "Biometric verification if required"
      ],
      timeline: "90 days for processing",
      online: "https://uidai.gov.in"
    },
    "Police Complaint": {
      types: ["FIR (Cognizable offenses)", "NCR (Non-cognizable offenses)"],
      process: [
        "Visit nearest police station",
        "Provide written complaint",
        "Get complaint number/FIR copy", 
        "Follow up on investigation"
      ],
      rights: [
        "Right to file FIR for cognizable offenses",
        "Right to get copy of FIR",
        "Right to legal aid if needed"
      ]
    }
  },
  schemes: {
    "PM-KISAN": {
      eligibility: "Small and marginal farmers with up to 2 hectares land",
      benefit: "Rs. 6000 per year in 3 installments",
      application: "Online at pmkisan.gov.in or through Common Service Centers",
      documents: ["Land ownership documents", "Aadhaar", "Bank account details"]
    },
    "Ayushman Bharat": {
      eligibility: "Based on SECC 2011 data or PM-JAY list",
      benefit: "Health insurance up to Rs. 5 lakh per family",
      application: "Generate Ayushman Card at hospitals or CSCs",
      website: "https://pmjay.gov.in"
    }
  },
  contacts: {
    "National Helplines": {
      "Women Helpline": "1091",
      "Child Helpline": "1098", 
      "Senior Citizen Helpline": "14567",
      "Tourist Helpline": "1363",
      "Railway Enquiry": "139",
      "Income Tax Helpline": "1961"
    },
    "Government Portals": {
      "Digital India": "https://digitalindia.gov.in",
      "India.gov.in": "https://india.gov.in",
      "MyGov": "https://mygov.in",
      "RTI Portal": "https://rtionline.gov.in"
    }
  }
};

// Conversation Memory Manager
class ConversationMemoryManager {
  private memory: Map<string, ConversationMemory> = new Map();

  getMemory(sessionId: string): ConversationMemory {
    if (!this.memory.has(sessionId)) {
      this.memory.set(sessionId, {
        messages: [],
        context: {}
      });
    }
    return this.memory.get(sessionId)!;
  }

  addMessage(sessionId: string, role: "user" | "assistant", content: string) {
    const memory = this.getMemory(sessionId);
    memory.messages.push({
      role,
      content,
      timestamp: new Date()
    });
    
    // Keep only last 10 messages for context
    if (memory.messages.length > 10) {
      memory.messages = memory.messages.slice(-10);
    }
  }

  updateContext(sessionId: string, context: Partial<ConversationMemory['context']>) {
    const memory = this.getMemory(sessionId);
    memory.context = { ...memory.context, ...context };
  }

  getRecentContext(sessionId: string): string {
    const memory = this.getMemory(sessionId);
    if (memory.messages.length === 0) return "";
    
    const recentMessages = memory.messages.slice(-5).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join("\n");
    
    return `Recent conversation:\n${recentMessages}`;
  }
}

// Legal Query Processor
class IndianLegalQueryProcessor {
  private knowledge: IndianLegalKnowledge;

  constructor() {
    this.knowledge = indianLegalKB;
  }

  findRelevantKnowledge(query: string): string {
    const queryLower = query.toLowerCase();
    let relevantInfo = "";

    // Check for RTI related queries
    if (queryLower.includes("rti") || queryLower.includes("right to information")) {
      const rtiInfo = this.knowledge.acts["RTI Act 2005"];
      relevantInfo += `**RTI Act 2005 Information:**\n`;
      relevantInfo += `Timeline: ${rtiInfo.timelines}\n`;
      relevantInfo += `Procedure: ${rtiInfo.procedures.join(", ")}\n\n`;
    }

    // Check for consumer complaint queries
    if (queryLower.includes("consumer") || queryLower.includes("complaint")) {
      const consumerInfo = this.knowledge.acts["Consumer Protection Act 2019"];
      relevantInfo += `**Consumer Protection Act 2019:**\n`;
      relevantInfo += `Jurisdiction: District (up to Rs. 1 crore), State (Rs. 1-10 crore), National (above Rs. 10 crore)\n`;
      relevantInfo += `Procedure: ${consumerInfo.procedures.join(", ")}\n\n`;
    }

    // Check for Aadhaar queries
    if (queryLower.includes("aadhaar") || queryLower.includes("aadhar")) {
      const aadhaarInfo = this.knowledge.procedures["Aadhaar Correction"];
      relevantInfo += `**Aadhaar Correction Process:**\n`;
      relevantInfo += `Documents: ${aadhaarInfo.documents.join(", ")}\n`;
      relevantInfo += `Process: ${aadhaarInfo.process.join(" → ")}\n`;
      relevantInfo += `Timeline: ${aadhaarInfo.timeline}\n\n`;
    }

    // Check for police complaint queries
    if (queryLower.includes("police") || queryLower.includes("fir") || queryLower.includes("complaint")) {
      const policeInfo = this.knowledge.procedures["Police Complaint"];
      relevantInfo += `**Police Complaint Process:**\n`;
      relevantInfo += `Types: ${policeInfo.types.join(", ")}\n`;
      relevantInfo += `Rights: ${policeInfo.rights.join(", ")}\n\n`;
    }

    // Check for government schemes
    if (queryLower.includes("pm kisan") || queryLower.includes("farmer")) {
      const kisanInfo = this.knowledge.schemes["PM-KISAN"];
      relevantInfo += `**PM-KISAN Scheme:**\n`;
      relevantInfo += `Eligibility: ${kisanInfo.eligibility}\n`;
      relevantInfo += `Benefit: ${kisanInfo.benefit}\n`;
      relevantInfo += `Application: ${kisanInfo.application}\n\n`;
    }

    return relevantInfo;
  }

  extractLegalTopics(query: string): string[] {
    const topics = [];
    const queryLower = query.toLowerCase();

    if (queryLower.includes("rti") || queryLower.includes("information")) topics.push("RTI");
    if (queryLower.includes("consumer") || queryLower.includes("complaint")) topics.push("Consumer Protection");
    if (queryLower.includes("tax") || queryLower.includes("income")) topics.push("Income Tax");
    if (queryLower.includes("aadhaar") || queryLower.includes("identity")) topics.push("Aadhaar");
    if (queryLower.includes("police") || queryLower.includes("fir")) topics.push("Police Complaint");
    if (queryLower.includes("tenant") || queryLower.includes("rent")) topics.push("Property Law");

    return topics;
  }
}

// Enhanced Chat Chain
export class IndianLegalChatChain {
  private memoryManager: ConversationMemoryManager;
  private queryProcessor: IndianLegalQueryProcessor;

  constructor() {
    this.memoryManager = new ConversationMemoryManager();
    this.queryProcessor = new IndianLegalQueryProcessor();
  }

  async processQuery(
    message: string, 
    sessionId: string = "default",
    context: { city?: string; language?: string; documentContext?: any } = {}
  ) {
    // Update context
    this.memoryManager.updateContext(sessionId, {
      userCity: context.city,
      userLanguage: context.language,
      documentContext: context.documentContext
    });

    // Add user message to memory
    this.memoryManager.addMessage(sessionId, "user", message);

    // Extract legal topics and find relevant knowledge
    const legalTopics = this.queryProcessor.extractLegalTopics(message);
    const relevantKnowledge = this.queryProcessor.findRelevantKnowledge(message);
    
    // Get conversation context
    const conversationContext = this.memoryManager.getRecentContext(sessionId);

    // Build enhanced system prompt with knowledge
    const systemPrompt = this.buildEnhancedSystemPrompt(context, relevantKnowledge, conversationContext, legalTopics);

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      
      // Add AI response to memory
      this.memoryManager.addMessage(sessionId, "assistant", response);

      // Update context with new legal topics
      if (legalTopics.length > 0) {
        const memory = this.memoryManager.getMemory(sessionId);
        const existingTopics = memory.context.legalTopics || [];
        const updatedTopics = [...new Set([...existingTopics, ...legalTopics])];
        this.memoryManager.updateContext(sessionId, { legalTopics: updatedTopics });
      }

      return {
        response,
        topics: legalTopics,
        relevantLaws: relevantKnowledge ? ["Found relevant legal information"] : [],
        suggestions: this.generateSuggestions(legalTopics)
      };

    } catch (error) {
      console.error("Chat chain error:", error);
      throw new Error("Failed to process query");
    }
  }

  private buildEnhancedSystemPrompt(
    context: any, 
    relevantKnowledge: string, 
    conversationContext: string,
    legalTopics: string[]
  ): string {
    return `You are LokAI, an expert AI assistant specialized in Indian laws, governance, and civic processes. 

**YOUR KNOWLEDGE BASE:**
${relevantKnowledge || "No specific knowledge retrieved for this query."}

**CONVERSATION CONTEXT:**
${conversationContext || "This is the start of our conversation."}

**USER CONTEXT:**
- City: ${context.city || "Not specified"}
- Language: ${context.language || "English"}
- Document Context: ${JSON.stringify(context.documentContext) || "No document uploaded"}
- Legal Topics Discussed: ${legalTopics.join(", ") || "None yet"}

**COMPREHENSIVE INDIAN LEGAL EXPERTISE:**
- Constitution of India (Fundamental Rights, Directive Principles, Fundamental Duties)
- Indian Penal Code (IPC), Code of Criminal Procedure (CrPC), Code of Civil Procedure (CPC)
- Personal laws (Hindu Marriage Act, Muslim Personal Law, Christian Marriage Act, Parsi Marriage Act)
- Consumer Protection Act 2019, RTI Act 2005, Labour laws (Industrial Disputes Act, Factories Act)
- Property laws (Transfer of Property Act, Registration Act), Tax laws (Income Tax, GST, Property Tax)
- Company Act 2013, Partnership Act, Indian Contract Act 1872
- Digital India Act, IT Act 2000, Data Protection laws (DPDPA 2023)

**GOVERNMENT SCHEMES & SERVICES:**
- Central schemes: PM-KISAN, Ayushman Bharat, DBT, JAM Trinity, PM-MUDRA, Stand Up India
- State-specific welfare schemes and benefits
- Digital platforms: DigiLocker, Aadhaar, UPI, e-Governance portals
- Banking and financial services (Jan Dhan, MUDRA, etc.)

**CIVIC PROCESSES:**
- Document verification and attestation procedures
- Police complaints (FIR, NCR), court procedures, legal aid
- Municipal services (property tax, water/electricity bills, birth/death certificates)
- Passport, Visa, PAN card, Driving license, Voter ID procedures
- Business registration (Udyog Aadhaar, MSME, GST registration, Shop & Establishment license)

**RESPONSE GUIDELINES:**
1. **Accuracy**: Always provide accurate, up-to-date information based on Indian laws as of 2025
2. **Legal References**: Include relevant section numbers, act names, and legal citations when applicable
3. **Practical Guidance**: Suggest specific government websites, helpline numbers, and official channels
4. **Step-by-Step**: Explain procedures clearly with required documents, fees, and timelines
5. **Regional Adaptation**: Adapt responses to the user's city/state for local variations in implementation
6. **Citizen-Friendly Language**: Use simple, accessible language while maintaining legal accuracy
7. **Cautionary Advice**: When unsure about specific cases, recommend consulting local authorities or legal experts
8. **Scheme Benefits**: Include relevant government scheme benefits the user might be eligible for
9. **Helpline Numbers**: Provide relevant helpline numbers and emergency contacts when appropriate
10. **Follow-up Actions**: Suggest next steps and additional resources

**FORMAT YOUR RESPONSE:**
- Use clear headings and bullet points
- Highlight important deadlines and fees
- Include relevant website links and contact information
- Provide both online and offline options when available
- Mention any recent policy changes or updates

Always prioritize official, government-verified information and current legal provisions as of 2025. If you reference the knowledge base information, ensure it's accurate and cite sources appropriately.`;
  }

  private generateSuggestions(topics: string[]): string[] {
    const suggestions = [];
    
    if (topics.includes("RTI")) {
      suggestions.push("How to track RTI application status?", "What are RTI exemptions under Section 8?");
    }
    if (topics.includes("Consumer Protection")) {
      suggestions.push("How to file online consumer complaint?", "What documents needed for consumer case?");
    }
    if (topics.includes("Aadhaar")) {
      suggestions.push("How to link Aadhaar with bank account?", "What if Aadhaar update is rejected?");
    }
    if (topics.includes("Income Tax")) {
      suggestions.push("How to file ITR online?", "What are tax saving options under 80C?");
    }

    return suggestions.slice(0, 3); // Return max 3 suggestions
  }

  // Method to clear memory for a session
  clearMemory(sessionId: string) {
    this.memoryManager = new ConversationMemoryManager();
  }

  // Method to get session statistics
  getSessionStats(sessionId: string) {
    const memory = this.memoryManager.getMemory(sessionId);
    return {
      messageCount: memory.messages.length,
      topicsDiscussed: memory.context.legalTopics || [],
      userCity: memory.context.userCity,
      language: memory.context.userLanguage
    };
  }
}

// Export singleton instance
export const indianLegalChatChain = new IndianLegalChatChain();

// Legacy export for backward compatibility
export async function analyzeText(text: string) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an AI assistant specialized in analyzing Indian government documents and legal papers. 

Analyze the following document and extract key information relevant to Indian citizens:

**DOCUMENT CLASSIFICATION:**
- Type (Property Tax Notice, Electricity Bill, Court Notice, Income Tax Notice, etc.)
- Issuing Authority (Municipal Corporation, State Electricity Board, Income Tax Department, etc.)
- Jurisdiction (City/District/State)

**KEY INFORMATION EXTRACTION:**
1. **Personal Details:** Names, addresses, identification numbers (Aadhaar, PAN, etc.)
2. **Financial Information:** Amounts due, tax calculations, penalties, refunds
3. **Legal References:** Relevant acts, sections, rules, notifications
4. **Important Dates:** Due dates, hearing dates, assessment periods, deadlines
5. **Required Actions:** 
   - Immediate actions required from citizen
   - Documents to be submitted
   - Fees to be paid
   - Appeals process if applicable
6. **Contact Information:** 
   - Office addresses and timings
   - Helpline numbers
   - Online portals and websites
   - Email IDs for correspondence
7. **Rights & Remedies:**
   - Citizen's rights under the law
   - Appeal procedures and timelines
   - Consumer grievance mechanisms

**COMPLIANCE & LEGAL ASPECTS:**
- Applicable Indian laws and regulations
- Penalties for non-compliance
- Grace periods and exemptions available
- Government schemes that might provide relief

Document content:
${text}

Respond in JSON format with structured data that includes all extracted information categorized as above.`,
      },
    ],
    model: "llama3-8b-8192",
    response_format: { type: "json_object" },
  });

  const response = chatCompletion.choices[0]?.message?.content;
  if (!response) {
    throw new Error("Failed to get response from AI");
  }
  return JSON.parse(response);
}
