import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const maxDuration = 300; // 5 minutes for image processing

// Helper function to get image dimensions from buffer
async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  try {
    // For JPEG/JPEG-2000
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      let i = 2;
      while (i < buffer.length - 8) {
        // Look for Start of Frame markers (0xFFC0, 0xFFC1, 0xFFC2, etc.)
        if (buffer[i] === 0xff && (buffer[i + 1] >= 0xc0 && buffer[i + 1] <= 0xc3)) {
          const height = (buffer[i + 5] << 8) | buffer[i + 6];
          const width = (buffer[i + 7] << 8) | buffer[i + 8];
          if (width > 0 && height > 0) {
            return { width, height };
          }
        }
        i++;
      }
    }
    // For PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      // PNG IHDR chunk is at bytes 16-24
      const width = (buffer[16] << 24) | (buffer[17] << 16) | (buffer[18] << 8) | buffer[19];
      const height = (buffer[20] << 24) | (buffer[21] << 16) | (buffer[22] << 8) | buffer[23];
      if (width > 0 && height > 0) {
        return { width, height };
      }
    }
    // For GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      const width = buffer[6] | (buffer[7] << 8);
      const height = buffer[8] | (buffer[9] << 8);
      if (width > 0 && height > 0) {
        return { width, height };
      }
    }
    // For WebP - check RIFF header
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      // WebP VP8 or VP8L format
      // For simple VP8: dimensions are at bytes 26-29
      if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        // VP8 format
        const width = (buffer[26] | (buffer[27] << 8)) & 0x3fff;
        const height = (buffer[28] | (buffer[29] << 8)) & 0x3fff;
        if (width > 0 && height > 0) {
          return { width, height };
        }
      }
    }
  } catch (error) {
    console.warn('Could not extract image dimensions:', error);
  }
  
  // Default fallback - return null to let Gemini use default
  return { width: 0, height: 0 };
}

// Map aspect ratio to Gemini's supported ratios
function getGeminiAspectRatio(width: number, height: number): string {
  const ratio = width / height;
  
  // Gemini supported aspect ratios from documentation
  const ratios: Array<{ ratio: number; value: string }> = [
    { ratio: 1, value: '1:1' },
    { ratio: 2/3, value: '2:3' },
    { ratio: 3/2, value: '3:2' },
    { ratio: 3/4, value: '3:4' },
    { ratio: 4/3, value: '4:3' },
    { ratio: 4/5, value: '4:5' },
    { ratio: 5/4, value: '5:4' },
    { ratio: 9/16, value: '9:16' },
    { ratio: 16/9, value: '16:9' },
    { ratio: 21/9, value: '21:9' },
  ];
  
  // Find closest matching ratio
  let closest = ratios[0];
  let minDiff = Math.abs(ratio - closest.ratio);
  
  for (const r of ratios) {
    const diff = Math.abs(ratio - r.ratio);
    if (diff < minDiff) {
      minDiff = diff;
      closest = r;
    }
  }
  
  return closest.value;
}

interface CustomizationOptions {
  height: number;
  dressStyle: string;
  position: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const optionsJson = formData.get('options') as string;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Parse customization options
    let options: CustomizationOptions | null = null;
    if (optionsJson) {
      try {
        options = JSON.parse(optionsJson);
      } catch (e) {
        console.warn('Failed to parse options, using defaults:', e);
      }
    }

    // Convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // Option 1: Use nano-banana API (prioritized for photo editing)
    // You'll need to set NANO_BANANA_API_KEY in your .env file
    if (process.env.NANO_BANANA_API_KEY) {
      // Get image dimensions to preserve aspect ratio
      const dimensions = await getImageDimensions(buffer);
      const result = await processWithNanoBanana(base64Image, imageFile.type, dimensions, options);
      return NextResponse.json({ imageUrl: result });
    }

    // Option 2: Use Replicate API (recommended for face swapping)
    // You'll need to set REPLICATE_API_TOKEN in your .env file
    if (process.env.REPLICATE_API_TOKEN) {
      const result = await processWithReplicate(base64Image);
      return NextResponse.json({ imageUrl: result });
    }

    // Option 3: Use OpenAI DALL-E image editing (alternative)
    // This requires a source image of Hunter and might not work as well
    if (process.env.OPENAI_API_KEY) {
      const result = await processWithOpenAI(base64Image);
      return NextResponse.json({ imageUrl: result });
    }

    // Fallback: For demo purposes, return a placeholder
    // In production, you should always have one of the above APIs configured
    return NextResponse.json(
      { error: 'No AI service configured. Please set NANO_BANANA_API_KEY, REPLICATE_API_TOKEN, or OPENAI_API_KEY in your environment variables.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process image' },
      { status: 500 }
    );
  }
}

async function processWithReplicate(base64Image: string): Promise<string> {
  // Using Replicate's face-swap model (inswapper_128)
  // You need to:
  // 1. Have Hunter's reference image URL (upload to a public URL or use Replicate uploads)
  // 2. Set REPLICATE_API_TOKEN in your .env file
  // 3. Set HUNTER_REFERENCE_IMAGE_URL in your .env (public URL to Hunter's photo)

  const hunterImageUrl = process.env.HUNTER_REFERENCE_IMAGE_URL;
  
  if (!hunterImageUrl) {
    throw new Error('HUNTER_REFERENCE_IMAGE_URL not configured. Please set it in your environment variables.');
  }

  // Convert base64 to a data URL that Replicate can use
  // Replicate accepts data URLs directly, or you can upload to a temporary URL
  // For simplicity, we'll use a data URL format
  const userImageDataUrl = `data:image/jpeg;base64,${base64Image}`;
  
  // Alternatively, if you need to upload to Replicate's file service first:
  // You can use Replicate's file upload API, but data URLs work for most models

  // Use a face-swap model from Replicate
  // Popular models include:
  // - "yan-ops/face_swap" - https://replicate.com/yan-ops/face_swap
  // - "logerzhu/face-swap" - https://replicate.com/logerzhu/face-swap
  // - "fofr/face-swap" - https://replicate.com/fofr/face-swap
  // 
  // You need to provide the model version ID (a hash like "abc123...")
  // Get it from the model's page on Replicate or via their API
  // Set REPLICATE_MODEL_VERSION in your .env file
  const modelVersion = process.env.REPLICATE_MODEL_VERSION;
  
  if (!modelVersion) {
    throw new Error('REPLICATE_MODEL_VERSION not configured. Please set it in your environment variables. Get the version ID from your chosen model on replicate.com');
  }
  
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: modelVersion,
      input: {
        target_image: userImageDataUrl, // The uploaded photo (data URL)
        swap_image: hunterImageUrl, // Hunter's reference photo URL
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Replicate API error');
  }

  const prediction = await response.json();

  // Poll for result (max 5 minutes)
  let result = prediction;
  let attempts = 0;
  const maxAttempts = 300; // 5 minutes max

  while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Check every 2 seconds
    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });
    
    if (!statusResponse.ok) {
      throw new Error('Failed to check prediction status');
    }
    
    result = await statusResponse.json();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Processing timed out. Please try again.');
  }

  if (result.status === 'failed' || result.status === 'canceled') {
    throw new Error(result.error || 'Processing failed');
  }

  if (!result.output || (Array.isArray(result.output) && result.output.length === 0)) {
    throw new Error('No output received from API');
  }

  // Return the output image URL (could be a string or array)
  return Array.isArray(result.output) ? result.output[0] : result.output;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function processWithOpenAI(_base64Image: string): Promise<string> {
  // Note: OpenAI's image editing is not ideal for face swapping
  // This is a placeholder - you might want to use DALL-E 3 with inpainting
  // or use a different service like Replicate
  
  // This is a simplified example - actual implementation would require
  // creating a mask and using image editing API
  // For face swapping, Replicate is recommended over OpenAI
  
  throw new Error('OpenAI image editing not fully implemented. Please use Replicate API for face swapping.');
}

async function processWithNanoBanana(base64Image: string, imageType: string, dimensions?: { width: number; height: number }, options?: CustomizationOptions | null): Promise<string> {
  // Using Google Gemini API (Nano Banana) for AI-powered photo editing
  // Reference: https://ai.google.dev/gemini-api/docs/image-generation
  // Nano Banana = gemini-2.5-flash-image model
  
  const apiKey = process.env.NANO_BANANA_API_KEY;
  const apiUrl = process.env.NANO_BANANA_API_URL || 'https://generativelanguage.googleapis.com/v1beta';
  const model = process.env.NANO_BANANA_MODEL || 'gemini-2.5-flash-image';
  let hunterReferenceUrl = process.env.HUNTER_REFERENCE_IMAGE_URL;
  
  if (!apiKey) {
    throw new Error('NANO_BANANA_API_KEY not configured. Please set it in your environment variables.');
  }

  // Log which reference image source is being used
  if (hunterReferenceUrl) {
    console.log('Using reference image from HUNTER_REFERENCE_IMAGE_URL:', hunterReferenceUrl);
  } else {
    console.log('HUNTER_REFERENCE_IMAGE_URL not set, checking for local images...');
  }

  // If no reference URL is set, try to find one in the hunter folder
  if (!hunterReferenceUrl) {
    try {
      const hunterFolder = path.join(process.cwd(), 'public', 'images', 'hunter');
      
      if (fs.existsSync(hunterFolder)) {
        const files = fs.readdirSync(hunterFolder);
        const imageFiles = files.filter((file: string) => 
          /\.(png|jpg|jpeg|webp|heic)$/i.test(file)
        );
        
        if (imageFiles.length > 0) {
          // Use the first image found
          hunterReferenceUrl = `/images/hunter/${imageFiles[0]}`;
          console.log('Auto-selected reference image from local folder:', hunterReferenceUrl);
          console.warn('WARNING: Using fallback local image. For best results, set HUNTER_REFERENCE_IMAGE_URL in your .env file with a public URL to Hunter\'s reference photo.');
        }
      }
    } catch (error) {
      console.warn('Could not auto-select reference image:', error);
    }
  }

  // Prepare image data for Gemini API (base64 string without data URL prefix)
  const imageBase64 = base64Image; // Already just base64 from the upload

  // Build the prompt with customization options
  let promptText = 'You are an expert at photo editing and image composition. Your task is to add Hunter (the person shown in the reference image provided) naturally into this photo. Hunter should appear realistic, with proper lighting, shadows, and perspective that match the scene. Make it look like Hunter was actually present when this photo was taken. Hunter should be seamlessly integrated into the image.';
  
  if (options) {
    const promptParts: string[] = [];
    
    // Height customization
    if (options.height !== undefined) {
      if (options.height <= 2) {
        promptParts.push('Hunter should appear very short/small in stature.');
      } else if (options.height <= 4) {
        promptParts.push('Hunter should appear shorter than average height.');
      } else if (options.height >= 7 && options.height <= 8) {
        promptParts.push('Hunter should appear taller than average height.');
      } else if (options.height >= 9) {
        promptParts.push('Hunter should appear very tall.');
      }
    }
    
    // Dress style
    if (options.dressStyle) {
      const styleDescriptions: { [key: string]: string } = {
        'casual': 'wearing casual, comfortable clothing appropriate for everyday wear',
        'formal': 'wearing formal, elegant attire such as a suit or formal dress',
        'sporty': 'wearing athletic, sporty clothing like activewear or sports gear',
        'beach': 'wearing beach-appropriate clothing like swimwear, shorts, or beach casual wear',
        'party': 'wearing festive, party-appropriate clothing that matches the celebration vibe',
        'business': 'wearing professional business attire appropriate for a corporate setting',
      };
      if (styleDescriptions[options.dressStyle]) {
        promptParts.push(`Hunter should be ${styleDescriptions[options.dressStyle]}.`);
      }
    }
    
    // Position
    if (options.position) {
      const positionDescriptions: { [key: string]: string } = {
        'foreground': 'Place Hunter prominently in the foreground of the image.',
        'middle': 'Place Hunter in the middle ground, naturally integrated with other subjects.',
        'background': 'Place Hunter in the background, subtly included in the scene.',
        'blend': 'Position Hunter naturally wherever it makes the most visual sense, blending seamlessly into the scene.',
      };
      if (positionDescriptions[options.position]) {
        promptParts.push(positionDescriptions[options.position]);
      }
    }
    
    if (promptParts.length > 0) {
      promptText += ' ' + promptParts.join(' ');
    }
  }

  // Build the request contents array
  // Gemini API uses a contents array with parts that can contain text and inlineData
  // We'll structure it with reference image first (if available), then target image with prompt
  interface ContentPart {
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }
  
  interface ContentItem {
    parts: ContentPart[];
  }
  
  const contents: ContentItem[] = [];
  
  // First, add reference image if available (so model understands what Hunter looks like)
  if (hunterReferenceUrl) {
    let referenceImageBase64: string;
    let referenceMimeType = 'image/png';
    
    try {
      // Handle local file paths
      if (hunterReferenceUrl.includes('localhost') || hunterReferenceUrl.startsWith('/images/')) {
        if (hunterReferenceUrl.includes('localhost')) {
          // Fetch from localhost
          const response = await fetch(hunterReferenceUrl);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            referenceImageBase64 = buffer.toString('base64');
            referenceMimeType = response.headers.get('content-type') || 'image/png';
          } else {
            throw new Error('Failed to fetch reference image from localhost');
          }
        } else {
          // Read from local filesystem
          const filePath = path.join(process.cwd(), 'public', hunterReferenceUrl.replace(/^\//, ''));
          if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            referenceImageBase64 = fileBuffer.toString('base64');
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: { [key: string]: string } = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.heic': 'image/heic',
              '.webp': 'image/webp',
            };
            referenceMimeType = mimeTypes[ext] || 'image/png';
          } else {
            throw new Error(`Reference image not found at ${filePath}`);
          }
        }

        // Add reference image as first content item
        contents.push({
          parts: [
            {
              text: 'This is a reference photo of Hunter. Study this image carefully to understand Hunter\'s facial features, appearance, body structure, skin tone, hair, and overall look. You will need to add this exact person into another photo.',
            },
            {
              inlineData: {
                mimeType: referenceMimeType,
                data: referenceImageBase64,
              },
            },
          ],
        });
        
        console.log('Reference image loaded successfully:', {
          size: referenceImageBase64.length,
          mimeType: referenceMimeType,
        });
      } else {
        // If it's a public URL, fetch it
        try {
          const response = await fetch(hunterReferenceUrl);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            referenceImageBase64 = buffer.toString('base64');
            referenceMimeType = response.headers.get('content-type') || 'image/png';
            
            contents.push({
              parts: [
                {
                  text: 'This is a reference photo of Hunter. Study this image carefully to understand Hunter\'s facial features, appearance, body structure, skin tone, hair, and overall look. You will need to add this exact person into another photo.',
                },
                {
                  inlineData: {
                    mimeType: referenceMimeType,
                    data: referenceImageBase64,
                  },
                },
              ],
            });
          }
        } catch (fetchError) {
          console.warn('Failed to fetch public URL reference image:', fetchError);
        }
      }
    } catch (error) {
      console.warn('Failed to load reference image, continuing with prompt only:', error);
      console.warn('WARNING: Processing without reference image may result in lower quality. Please ensure HUNTER_REFERENCE_IMAGE_URL is set correctly in your .env file.');
      // Continue without reference image - the prompt should still work
    }
  } else {
    console.warn('WARNING: No reference image configured. Set HUNTER_REFERENCE_IMAGE_URL in your .env file for best results.');
  }

  // Now add the target image with the main prompt
  contents.push({
    parts: [
      {
        text: promptText + ' The person from the reference image above should be added into THIS photo (the image that follows). Match their exact appearance, facial features, and characteristics from the reference image.',
      },
      {
        inlineData: {
          mimeType: imageType,
          data: imageBase64,
        },
      },
    ],
  });

  const endpoint = `${apiUrl}/models/${model}:generateContent`;

  // Build request body with image configuration to preserve dimensions
  interface RequestBody {
    contents: ContentItem[];
    generationConfig?: {
      imageConfig: {
        aspectRatio: string;
      };
    };
  }
  
  const requestBody: RequestBody = {
    contents,
  };

  // Add image configuration to preserve aspect ratio if dimensions are provided
  if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
    const aspectRatio = getGeminiAspectRatio(dimensions.width, dimensions.height);
    requestBody.generationConfig = {
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    };
    console.log('Preserving image dimensions:', {
      original: `${dimensions.width}x${dimensions.height}`,
      aspectRatio,
    });
  } else {
    console.log('Image dimensions not detected, using default aspect ratio');
  }

  console.log('Calling Gemini API (Nano Banana):', {
    endpoint,
    model,
    hasReferenceImage: hunterReferenceUrl && contents[0].parts.length > 2,
    aspectRatio: dimensions ? getGeminiAspectRatio(dimensions.width, dimensions.height) : 'default',
    promptLength: promptText.length,
    partsCount: contents[0].parts.length,
    referenceUrl: hunterReferenceUrl || 'none',
  });

  try {
    // Gemini API uses API key as query parameter: ?key=API_KEY
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
      try {
        const error = await response.json();
        errorMessage = error.error?.message || error.message || errorMessage;
        console.error('Gemini API error response:', error);
      } catch {
        const text = await response.text().catch(() => '');
        console.error('Gemini API error (non-JSON):', text);
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    interface SafetyRating {
      probability?: string;
    }
    
    interface CandidatePart {
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string;
      };
    }
    
    interface Candidate {
      content?: {
        parts: CandidatePart[];
      };
      finishReason?: string;
      safetyRatings?: SafetyRating[];
    }
    
    interface GeminiResponse {
      candidates?: Candidate[];
    }
    
    const result = await response.json() as GeminiResponse;

    console.log('Gemini API response received:', {
      hasCandidates: !!result.candidates,
      candidatesCount: result.candidates?.length || 0,
      finishReason: result.candidates?.[0]?.finishReason,
    });

    // Extract image from Gemini API response
    // The response contains candidates with content.parts array
    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];
      
      // Check for safety ratings or errors
      if (candidate.safetyRatings) {
        console.log('Safety ratings:', candidate.safetyRatings);
        const blocked = candidate.safetyRatings.some((rating: SafetyRating) => 
          rating.probability === 'HIGH' || rating.probability === 'MEDIUM'
        );
        if (blocked) {
          throw new Error('Content was blocked by safety filters. Please try with a different image or adjust your request.');
        }
      }
      
      if (candidate.content && candidate.content.parts) {
        console.log('Processing candidate parts:', candidate.content.parts.length);
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            // Return as data URL
            const mimeType = part.inlineData.mimeType || 'image/png';
            console.log('Image found in response!', { mimeType, dataLength: part.inlineData.data.length });
            return `data:${mimeType};base64,${part.inlineData.data}`;
          }
          // Also check for text parts that might contain URLs or explanations
          if (part.text) {
            console.log('Gemini response text:', part.text);
            // Sometimes Gemini returns text explaining why it can't generate an image
            if (part.text.toLowerCase().includes('cannot') || part.text.toLowerCase().includes('unable')) {
              throw new Error(`Gemini API returned: ${part.text}`);
            }
          }
        }
      }
      
      // Check finish reason
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        console.warn('Unexpected finish reason:', candidate.finishReason);
        throw new Error(`Image generation finished with reason: ${candidate.finishReason}`);
      }
    }

    // If no image found, log the full response for debugging
    console.error('No image found in Gemini API response. Full response:', JSON.stringify(result, null, 2));
    throw new Error('No image found in Gemini API response. The model may have returned text instead of an image. Check the console logs for details.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch failed')) {
      throw new Error(
        `Failed to connect to Gemini API. This might be a network issue or the API endpoint is incorrect. ` +
        `Error: ${error.message}. ` +
        `Make sure NANO_BANANA_API_KEY and NANO_BANANA_API_URL are correctly set in .env.local`
      );
    }
    throw error;
  }
}

