import { RecordFormData } from '../types';

export interface ValidationErrors {
  [key: string]: string;
}

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return undefined;
}

export function validateRecordForm(data: Partial<RecordFormData>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (data.title.trim().length > 80) {
    errors.title = 'Title must be 80 characters or less';
  }

  if (!data.description?.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  } else if (data.description.trim().length > 500) {
    errors.description = 'Description must be 500 characters or less';
  }

  if (!data.category) {
    errors.category = 'Please select a category';
  }

  if (!data.status) {
    errors.status = 'Please select a status';
  }

  return errors;
}
