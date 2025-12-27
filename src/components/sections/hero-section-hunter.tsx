export default function HeroSection() {
  return (
    <section className="relative py-10 overflow-hidden bg-gradient-to-b from-primary-50 to-white dark:from-dark-primary dark:to-dark-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            iwanthunter.com
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Upload a photo and watch Hunter magically appear in it! 🎩✨
            <br className="hidden sm:block" />
            <span className="text-primary-600 dark:text-primary-400 font-semibold">
              Skip the awkward &quot;I wasn&apos;t there&quot; conversations forever.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#upload"
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-full transition-all hover:scale-105 shadow-lg"
            >
              Get Started Free
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-white dark:bg-dark-primary border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-full transition-all hover:scale-105"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

