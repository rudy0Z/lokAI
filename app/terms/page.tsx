export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>

        <div className="prose prose-lg">
          <h2>1. Acceptance of Terms</h2>
          <p>By using LokAI, you agree to these terms of service and our privacy policy.</p>

          <h2>2. Service Description</h2>
          <p>
            LokAI provides AI-powered assistance for understanding government documents and civic processes. We do not
            provide legal advice.
          </p>

          <h2>3. User Responsibilities</h2>
          <p>Users are responsible for the accuracy of information provided and compliance with applicable laws.</p>

          <h2>4. Disclaimer</h2>
          <p>
            LokAI is an assistance tool. Always verify information with official government sources before taking
            action.
          </p>
        </div>
      </div>
    </div>
  )
}
