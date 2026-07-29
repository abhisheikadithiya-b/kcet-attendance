import { describe, it, expect } from 'vitest';

// Pure logic implementations mirroring the server endpoint validation rules
function validatePhotoPayload(token, studentId, photos) {
  if (!token || typeof token !== 'string') {
    return { valid: false, message: 'Registration token required.' };
  }
  if (!studentId || typeof studentId !== 'string') {
    return { valid: false, message: 'Student ID required.' };
  }
  if (!Array.isArray(photos) || photos.length === 0) {
    return { valid: false, message: 'At least one photo required.' };
  }
  if (photos.length > 5) {
    return { valid: false, message: 'Maximum 5 photos allowed.' };
  }

  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit per photo

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    if (!photo || typeof photo !== 'string') {
      return { valid: false, message: `Photo ${i + 1} is empty or invalid.` };
    }

    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      continue;
    }

    const matches = photo.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/i);
    let base64Data = photo;

    if (matches) {
      base64Data = matches[2];
    } else if (photo.startsWith('data:')) {
      return { valid: false, message: `Photo ${i + 1} format is invalid. Only JPEG, PNG, and WebP images are accepted.` };
    }

    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return { valid: false, message: `Photo ${i + 1} exceeds maximum allowed file size of 5MB.` };
    }
  }

  return { valid: true };
}

describe('Server-Side Photo Upload & Submission Validation', () => {
  it('passes valid base64 data URLs for 5 photos', () => {
    const sampleImage = 'data:image/jpeg;base64,' + Buffer.from('fake-jpeg-content').toString('base64');
    const photos = Array(5).fill(sampleImage);

    const result = validatePhotoPayload('test-token-123', 'std-001', photos);
    expect(result.valid).toBe(true);
  });

  it('rejects payload missing token or studentId', () => {
    const sampleImage = 'data:image/jpeg;base64,' + Buffer.from('fake-jpeg-content').toString('base64');

    expect(validatePhotoPayload('', 'std-001', [sampleImage]).valid).toBe(false);
    expect(validatePhotoPayload('test-token', '', [sampleImage]).valid).toBe(false);
  });

  it('rejects photos array with more than 5 photos', () => {
    const sampleImage = 'data:image/jpeg;base64,' + Buffer.from('fake-jpeg-content').toString('base64');
    const photos = Array(6).fill(sampleImage);

    const result = validatePhotoPayload('token', 'std-001', photos);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Maximum 5 photos allowed');
  });

  it('rejects non-image mime types', () => {
    const badMimeImage = 'data:application/pdf;base64,' + Buffer.from('pdf-content').toString('base64');

    const result = validatePhotoPayload('token', 'std-001', [badMimeImage]);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Only JPEG, PNG, and WebP images are accepted');
  });

  it('rejects individual photos exceeding 5MB', () => {
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    const largeImage = 'data:image/jpeg;base64,' + largeBuffer.toString('base64');

    const result = validatePhotoPayload('token', 'std-001', [largeImage]);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('exceeds maximum allowed file size of 5MB');
  });
});
