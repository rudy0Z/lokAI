import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function secureApiCall(endpoint: string, data: any) {
  const response = await fetch("/api/secure-api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint,
      data,
    }),
  });

  return response.json();
}

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

export async function generateParaphrasing(text: string, style: string) {
  return secureApiCall("/paraphrase", { text, style })
}

export async function generateCitation(source: string, format: "apa" | "mla" | "chicago") {
  return secureApiCall("/citation", { source, format })
}
