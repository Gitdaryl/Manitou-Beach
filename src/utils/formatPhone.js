/**
 * Format a phone number string for display: 1234567890 → 123-456-7890
 * Handles any input format — strips non-digits first, then formats.
 * Returns the original string if it doesn't contain exactly 10 or 11 digits.
 */
export default function formatPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  // Handle 11-digit numbers starting with 1 (US country code)
  const d = digits.length === 11 && digits[0] === '1' ? digits.slice(1) : digits;
  if (d.length !== 10) return phone;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}
