export default function UseCasesSection() {
  const useCases = [
    {
      title: 'Group Photos',
      description: 'Couldn\'t make it to the family reunion? Slept through the team photo? No worries! Hunter will make it look like you were totally there (with perfect timing, of course).',
      emoji: '👨‍👩‍👧‍👦',
      gradient: 'from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30',
      border: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Vacation Pictures',
      description: 'Jealous of those beach photos? That mountain hike? Just upload and poof - you\'re there, looking like you actually went (because you totally did... digitally).',
      emoji: '🏖️',
      gradient: 'from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30',
      border: 'border-amber-200 dark:border-amber-800',
    },
    {
      title: 'Event Photos',
      description: 'Weddings, parties, concerts - you name it. Hunter makes it look like you have the most amazing social life. Your Instagram followers will be impressed (and slightly confused).',
      emoji: '🎉',
      gradient: 'from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30',
      border: 'border-pink-200 dark:border-pink-800',
    },
    {
      title: 'Memories',
      description: 'Create "memories" of moments that never happened. Because who says memories have to be real? (This is definitely not therapy, this is just for fun!)',
      emoji: '📸',
      gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-dark-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Perfect For 🎯
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Whether you missed an event, forgot to show up, or just want to be in more photos (no judgment), we&apos;ve got you covered!
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${useCase.gradient} p-8 rounded-2xl border-2 ${useCase.border} hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
              >
                <div className="text-5xl mb-4">{useCase.emoji}</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

