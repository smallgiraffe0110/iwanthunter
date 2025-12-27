export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Upload Your Photo 📸',
      description: 'Pick any photo where Hunter should have been. That beach trip you missed? The wedding you skipped? We\'ve got you covered!',
      emoji: '📸',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'AI Works Its Magic ✨',
      description: 'Our AI does some serious wizardry to make Hunter look like he was totally there all along. Lighting? Matched. Shadows? Perfect. Suspiciously realistic? Absolutely.',
      emoji: '✨',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Show Off Your Result 🎉',
      description: 'Download your masterpiece and prepare for all the "Wait, you were there?!" reactions. Time to flex those photo editing skills (that you totally didn\'t have before).',
      emoji: '🎉',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-[41px] bg-white dark:bg-dark-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works 🪄
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three easy steps to photo greatness. No Photoshop degree required (though we won't judge if you brag about your new "skills").
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 text-primary-600 dark:text-primary-400 mb-6 shadow-lg">
                    <span className="text-3xl absolute">{step.emoji}</span>
                  </div>
                  <div className="absolute -top-6 -left-6 text-7xl font-bold text-gray-100 dark:text-gray-800 -z-10 opacity-50">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

