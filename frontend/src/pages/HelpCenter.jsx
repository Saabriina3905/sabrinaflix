import React, { useState } from "react";
import { ChevronDown, ChevronUp, Mail, MessageCircle, BookOpen, HelpCircle } from "lucide-react";

const HelpCenter = () => {
  const [openSection, setOpenSection] = useState(null);

  const faqs = [
    {
      category: "Account & Billing",
      questions: [
        {
          q: "How do I change my password?",
          a: "Go to Settings > Account > Change Password. Enter your current password and your new password twice to confirm."
        },
        {
          q: "How do I cancel my subscription?",
          a: "Go to Settings > Subscription > Cancel Subscription. Your subscription will remain active until the end of your current billing period."
        },
        {
          q: "How do I update my payment method?",
          a: "Navigate to Settings > Subscription > Payment Methods. Click 'Add Payment Method' or 'Edit' next to an existing method."
        }
      ]
    },
    {
      category: "Streaming & Playback",
      questions: [
        {
          q: "Why is my video buffering?",
          a: "Buffering can be caused by slow internet connection. Try reducing video quality in Settings > Playback > Data Usage, or check your internet connection speed."
        },
        {
          q: "Can I download content to watch offline?",
          a: "Currently, offline downloads are not available. We're working on adding this feature in a future update."
        },
        {
          q: "What video quality options are available?",
          a: "We support multiple quality options: Auto, Low (480p), Medium (720p), High (1080p), and Ultra (4K) based on your subscription plan and device capabilities."
        }
      ]
    },
    {
      category: "Content & Recommendations",
      questions: [
        {
          q: "How does the AI recommendation system work?",
          a: "Our AI analyzes your viewing history, ratings, and preferences to suggest content you'll love. The more you watch and rate, the better the recommendations become."
        },
        {
          q: "How do I save content for later?",
          a: "Click the 'Save for Later' button on any movie or TV show page. You can access your saved list from your profile menu."
        },
        {
          q: "Can I create multiple profiles?",
          a: "Currently, each account supports one profile. Multiple profile support is coming soon!"
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "The app won't load on my device",
          a: "Try clearing your browser cache, updating your browser, or restarting your device. If the problem persists, contact our support team."
        },
        {
          q: "I'm getting error messages",
          a: "Error messages usually indicate a connection issue. Check your internet connection, try refreshing the page, or contact support with the specific error code."
        },
        {
          q: "How do I report a bug?",
          a: "You can report bugs by clicking 'Contact Support' below or emailing us at support@sabrinaflix.com with details about the issue."
        }
      ]
    }
  ];

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <HelpCircle className="w-16 h-16 text-[#e50914]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-gray-400 text-lg">
            Find answers to common questions and get the support you need
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-[#232323] rounded-lg p-6 hover:bg-[#2a2a2a] transition cursor-pointer">
            <Mail className="w-8 h-8 text-[#e50914] mb-3" />
            <h3 className="text-xl font-semibold mb-2">Email Support</h3>
            <p className="text-gray-400 text-sm">
              Send us an email and we'll get back to you within 24 hours
            </p>
            <a
              href="mailto:support@sabrinaflix.com"
              className="text-[#e50914] hover:underline mt-2 inline-block"
            >
              support@sabrinaflix.com
            </a>
          </div>

          <div className="bg-[#232323] rounded-lg p-6 hover:bg-[#2a2a2a] transition cursor-pointer">
            <MessageCircle className="w-8 h-8 text-[#e50914] mb-3" />
            <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-400 text-sm">
              Chat with our support team in real-time (Available 24/7)
            </p>
            <button className="text-[#e50914] hover:underline mt-2">
              Start Chat
            </button>
          </div>

          <div className="bg-[#232323] rounded-lg p-6 hover:bg-[#2a2a2a] transition cursor-pointer">
            <BookOpen className="w-8 h-8 text-[#e50914] mb-3" />
            <h3 className="text-xl font-semibold mb-2">Documentation</h3>
            <p className="text-gray-400 text-sm">
              Browse our comprehensive guides and tutorials
            </p>
            <button className="text-[#e50914] hover:underline mt-2">
              View Docs
            </button>
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          {faqs.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-[#232323] rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(sectionIndex)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#2a2a2a] transition"
              >
                <h3 className="text-xl font-semibold">{section.category}</h3>
                {openSection === sectionIndex ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {openSection === sectionIndex && (
                <div className="px-6 py-4 border-t border-gray-700">
                  <div className="space-y-6">
                    {section.questions.map((faq, faqIndex) => (
                      <div key={faqIndex} className="pb-4 border-b border-gray-800 last:border-b-0">
                        <h4 className="font-semibold text-lg mb-2">{faq.q}</h4>
                        <p className="text-gray-400">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="mt-12 bg-[#232323] rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Still Need Help?</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Email</label>
              <input
                type="email"
                className="w-full bg-[#181818] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#e50914]"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                className="w-full bg-[#181818] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#e50914]"
                placeholder="What can we help you with?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                rows={5}
                className="w-full bg-[#181818] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#e50914] resize-none"
                placeholder="Describe your issue or question..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#e50914] text-white py-3 rounded font-semibold hover:bg-[#c40812] transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;

