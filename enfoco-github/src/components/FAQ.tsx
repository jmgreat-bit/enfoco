import React, { useState } from 'react';

export const FAQ: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqData = [
    {
      question: "What is ENFOCO?",
      answer: "ENFOCO is a global content discovery platform that helps you find and read articles from around the world. We use AI-powered translation to break down language barriers, allowing you to search in your local language and discover content from any country."
    },
    {
      question: "How does the AI Translator work?",
      answer: "Our AI Translator is a powerful feature that lets you search in your local language and discover content from any country. Simply search in your native language, get translations in any country's language, and discover local information from that country."
    },
    {
      question: "What countries and languages are supported?",
      answer: "We currently have content from 5 countries (Ethiopia, Kenya, Rwanda, Tanzania, Vietnam) and support 100+ languages for translation. We're continuously expanding our content sources and language support."
    },
    {
      question: "How do I save articles for later reading?",
      answer: "Click the bookmark icon on any article card to save it. You can access all your saved articles in the 'Saved' section of the sidebar. Click the bookmark again to unsave an article."
    },
    {
      question: "What's the difference between Explore, Verified, and Global Stream?",
      answer: "Explore shows content in a Netflix-style horizontal scrolling format for discovery. Verified displays only verified, high-quality articles in a grid. Global Stream shows all articles from our database in a grid format."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes! We use industry-standard security measures, encrypt all data, and follow strict privacy practices. Your personal information is protected and we never share your data without your consent."
    },
    {
      question: "How do I change my country preference?",
      answer: "Your country preference is set during signup and stored in your profile. The dashboard country dropdown is for temporary filtering and doesn't change your profile setting. You can update your profile country in the Profile Settings."
    },
    {
      question: "Why can't I see content in some categories?",
      answer: "Currently, only Articles are available. Videos, Books, and Audio sections show 'Coming Soon' as we're focusing on articles first. More content types will be added in future updates."
    },
    {
      question: "How do I use the search function?",
      answer: "Type your search query in the search bar. The search works in Verified and Global Stream tabs, filtering content by your query and selected country. Explore tab doesn't have search - it's for discovery through scrolling."
    },
    {
      question: "Is ENFOCO free to use?",
      answer: "Yes! ENFOCO is currently free to use. We may introduce premium features in the future, but the core functionality will always remain free for our users."
    }
  ];

  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know about ENFOCO
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-700 transition-colors"
              >
                <span className="text-white font-medium text-lg">{faq.question}</span>
                <svg
                  className={`w-6 h-6 text-cyan-400 transition-transform ${
                    openFAQ === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFAQ === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400">
            Still have questions? Check out our Help page or use the Contact link in the footer.
          </p>
        </div>
      </div>

    </section>
  );
};
