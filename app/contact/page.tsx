export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-xl text-gray-600">We're here to help you navigate civic processes</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Get in Touch</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-gray-600">support@lokai.gov.in</p>
              </div>
              <div>
                <h3 className="font-medium">Phone</h3>
                <p className="text-gray-600">1800-123-4567 (Toll Free)</p>
              </div>
              <div>
                <h3 className="font-medium">Office Hours</h3>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Feedback</h2>
            <p className="text-gray-600">
              Your feedback helps us improve LokAI. Let us know how we can better serve citizens like you.
            </p>
            <div className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full p-3 border border-gray-300 rounded-lg" />
              <input type="email" placeholder="Your Email" className="w-full p-3 border border-gray-300 rounded-lg" />
              <textarea placeholder="Your Message" rows={4} className="w-full p-3 border border-gray-300 rounded-lg" />
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
