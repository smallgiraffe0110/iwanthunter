# iwanthunter.com

A simple web application where you can upload a photo and Hunter will be added into it using AI. No need to be physically present in photos anymore!

Built with **Next.js** and **Tailwind CSS**.

## Features

- **Simple Upload Interface:** Drag and drop or click to upload photos
- **AI Photo Editing:** Uses nano-banana or Replicate API to add Hunter into your photos
- **Real-time Processing:** See your results in real-time
- **Download Results:** Download the processed images instantly

## Setup Instructions

### Prerequisites

1. **AI Service Account (Choose one):**
   - **nano-banana (Recommended):** Sign up for nano-banana API access
   - **Replicate (Alternative):** Sign up at [replicate.com](https://replicate.com)

2. **Hunter's Reference Image:**
   - Upload a clear photo of Hunter's face to a publicly accessible URL
   - This will be used as the source for adding Hunter into photos
   - Recommended: Use a high-quality headshot with good lighting

### Environment Variables

Create a `.env.local` file in the root directory with:

**For nano-banana (Recommended):**
```env
NANO_BANANA_API_KEY=your_nano_banana_api_key_here
NANO_BANANA_API_URL=https://api.nanobanana.com/v1
NANO_BANANA_MODEL=default
HUNTER_REFERENCE_IMAGE_URL=https://your-public-url.com/hunter-photo.jpg
```

**For Replicate (Alternative):**
```env
REPLICATE_API_TOKEN=your_replicate_api_token_here
REPLICATE_MODEL_VERSION=your_model_version_id_here
HUNTER_REFERENCE_IMAGE_URL=https://your-public-url.com/hunter-photo.jpg
```

**Note:** The service checks for nano-banana first, then Replicate, then OpenAI. Only one service needs to be configured.

#### Setting up nano-banana API:

1. **Get nano-banana API Key:**
   - Sign up for nano-banana API access
   - Navigate to your account dashboard
   - Generate an API key
   - Copy the API key to use in `NANO_BANANA_API_KEY`

2. **Configure API Endpoint (Optional):**
   - The default endpoint is `https://api.nanobanana.com/v1`
   - If you have a custom endpoint, set `NANO_BANANA_API_URL` in your `.env.local`
   - Leave this out to use the default endpoint

3. **Choose Model (Optional):**
   - Set `NANO_BANANA_MODEL` to specify which model to use
   - Defaults to `'default'` if not specified
   - Check nano-banana documentation for available models

4. **Hunter's Reference Image:**
   - Upload a clear, front-facing photo of Hunter to a publicly accessible URL
   - Good options:
     - Upload to Imgur, Cloudinary, or similar image hosting
     - Or use nano-banana's file upload service if available
   - The photo should have good lighting and Hunter's face clearly visible
   - Copy the public URL to use in `HUNTER_REFERENCE_IMAGE_URL`
   - **Note:** If you don't provide a reference image, nano-banana will use natural language prompts instead

#### Setting up Replicate API (Alternative):

1. **Get Replicate API Token:**
   - Sign up at [replicate.com](https://replicate.com)
   - Go to your account settings → API tokens
   - Copy your API token

2. **Choose a Face-Swap Model:**
   Popular models on Replicate:
   - [yan-ops/face_swap](https://replicate.com/yan-ops/face_swap)
   - [logerzhu/face-swap](https://replicate.com/logerzhu/face-swap)
   - [fofr/face-swap](https://replicate.com/fofr/face-swap)
   
   Visit the model page and copy the version ID (it looks like a long hash, e.g., `abc123def456...`)

3. **Hunter's Reference Image:**
   - Upload a clear, front-facing photo of Hunter to a publicly accessible URL
   - Good options:
     - Upload to Imgur, Cloudinary, or similar image hosting
     - Or use Replicate's file upload API to host it
   - The photo should have good lighting and Hunter's face clearly visible
   - Copy the public URL to use in `HUNTER_REFERENCE_IMAGE_URL`

## Getting Started

We are using npm as our package manager.

> To use Yarn or any other package manager, delete the `package-lock.json` file and run the below commands using the package manager of your choice.

1. Install dependencies

   ```bash
   npm install
   ```

2. Create a `.env.local` file and add your environment variables (see Setup Instructions above)

3. Development server

   ```bash
   npm run dev
   ```

   Your app template should now be running on [http://localhost:3000](http://localhost:3000).

   Additional commands:

   ```bash
   npm run build # Build the project
   npm run start # Start the production server
   ```

## Tech Stack

- [Next.js](https://nextjs.org) 15 with App Router
- [Tailwind CSS](https://tailwindcss.com) for styling
- [nano-banana API](https://nanobanana.ai) for AI photo editing (primary)
- [Replicate API](https://replicate.com) for AI face-swapping (alternative)
- TypeScript for type safety
