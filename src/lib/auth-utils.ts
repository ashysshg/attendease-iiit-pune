export type UserRole = 'faculty' | 'student' | null;

export const detectUserRole = (email: string): UserRole => {
  if (!email) return null;
  
  const emailLower = email.toLowerCase().trim();
  
  // Faculty: emails ending in @iiitp.ac.in (e.g., teacher@iiitp.ac.in)
  if (emailLower.endsWith('@iiitp.ac.in')) {
    return 'faculty';
  }
  
  // Student: emails starting with 9 digits and ending in @cse.iiitp.ac.in or @ece.iiitp.ac.in
  const studentPattern = /^\d{9}@(cse|ece)\.iiitp\.ac\.in$/;
  if (studentPattern.test(emailLower)) {
    return 'student';
  }
  
  return null;
};

export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  const role = detectUserRole(email);
  
  if (!role) {
    return { 
      valid: false, 
      message: 'Invalid email format. Use faculty@iiitp.ac.in or 123456789@cse.iiitp.ac.in' 
    };
  }
  
  return { valid: true };
};

export const generateQRData = (classId: string): string => {
  const timestamp = Date.now();
  return JSON.stringify({
    classId: classId.toUpperCase(),
    timestamp,
    expiresAt: timestamp + 15000, // 15 seconds
  });
};

export const parseQRData = (data: string): { classId: string; timestamp: number; expiresAt: number } | null => {
  try {
    const parsed = JSON.parse(data);
    if (parsed.classId && parsed.timestamp) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};
