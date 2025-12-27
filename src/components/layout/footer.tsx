import { getCurrentYear } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gray-900">
      <span className="absolute top-0 -translate-x-1/2 left-1/2">
        <svg
          width="1260"
          height="457"
          viewBox="0 0 1260 457"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_f_11105_867)">
            <circle cx="630" cy="-173.299" r="230" fill="#3B2EFF" />
          </g>
          <defs>
            <filter
              id="filter0_f_11105_867"
              x="0"
              y="-803.299"
              width="1260"
              height="1260"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="200"
                result="effect1_foregroundBlur_11105_867"
              />
            </filter>
          </defs>
        </svg>
      </span>
      <div className="relative z-10 py-6">
        <div className="container px-5 mx-auto sm:px-7">
          <div className="grid gap-y-8 gap-x-6">
            <div className="max-w-2xl">
              <div>
                <Link href="/" className="block mb-6">
                  <span className="text-xl font-bold text-white">
                    iwanthunter.com
                  </span>
                </Link>
                <p className="block text-sm text-gray-400 mb-9">
                  Upload a photo and Hunter will be added into it using AI. 
                  No need to be physically present in photos anymore!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="container relative z-10 px-5 mx-auto sm:px-7">
          <div className="py-5 text-center">
            <p className="text-sm text-gray-500">
              &copy; {getCurrentYear()} iwanthunter.com - All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
