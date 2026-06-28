/** Khớp CreateAdminDto / UpdateAdminDto (@MinLength(6)) trên backend. */
export const ADMIN_PASSWORD_MIN_LENGTH = 8;

export const ADMIN_PASSWORD_HINT = `Tối thiểu ${ADMIN_PASSWORD_MIN_LENGTH} ký tự`;

export function validateAdminPassword(
  password: string | undefined,
  { required = false }: { required?: boolean } = {},
): string | null {
  if (!password) {
    return required ? "Vui lòng nhập mật khẩu." : null;
  }
  if (password.length < ADMIN_PASSWORD_MIN_LENGTH) {
    return `Mật khẩu phải có ít nhất ${ADMIN_PASSWORD_MIN_LENGTH} ký tự.`;
  }
  return null;
}
