'use client';

import { MinusIcon, PlusIcon } from '@/icons/icons';
import { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [activeItem, setActiveItem] = useState<number | null>(1);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'How does the AI face-swapping work?',
      answer:
        'Our service uses advanced AI models from Replicate to seamlessly detect faces in your photo and replace them with Hunter\'s face. The technology ensures natural lighting, shadows, and positioning for a realistic result.',
    },
    {
      id: 2,
      question: 'Is my photo stored or shared?',
      answer:
        'No, your privacy is our priority. Photos are processed securely and automatically deleted after processing. We never store, share, or use your images for any other purpose.',
    },
    {
      id: 3,
      question: 'What photo formats are supported?',
      answer:
        'We support common image formats including JPG, JPEG, PNG, and GIF. For best results, we recommend using high-quality photos with good lighting and clear faces.',
    },
    {
      id: 4,
      question: 'How long does processing take?',
      answer:
        'Typically, processing takes 30 seconds to 2 minutes depending on the image size and complexity. You\'ll see a progress indicator while your photo is being processed.',
    },
    {
      id: 5,
      question: 'Is this service really free?',
      answer:
        'Yes, completely free! There are no hidden fees, subscriptions, or credit card requirements. Just upload, process, and download your result.',
    },
    {
      id: 6,
      question: 'What if the result doesn\'t look good?',
      answer:
        'Results can vary based on photo quality, lighting, and face angles. For best results, use clear, well-lit photos with faces looking directly at the camera. You can always try again with a different photo!',
    },
  ];

  const toggleItem = (itemId: number) => {
    setActiveItem(activeItem === itemId ? null : itemId);
  };

  return (
    <section id="faq" className="py-6 bg-gray-50 dark:bg-dark-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions 🤔
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Got questions? We&apos;ve got answers (and probably some jokes too).
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <FAQItem
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                onToggle={() => toggleItem(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQItem({
  item,
  isActive,
  onToggle,
}: {
  item: FAQItem;
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <button
        type="button"
        className="flex items-center justify-between w-full text-left"
        onClick={onToggle}
        aria-expanded={isActive}
      >
        <span className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
          {item.question}
        </span>
        <span className="flex-shrink-0">
          {isActive ? (
            <MinusIcon className="w-5 h-5 text-primary-500" />
          ) : (
            <PlusIcon className="w-5 h-5 text-gray-400" />
          )}
        </span>
      </button>
      {isActive && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

