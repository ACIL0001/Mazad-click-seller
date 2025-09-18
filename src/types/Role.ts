
export enum RoleCode {
  CLIENT = 'CLIENT',
  RESELLER = 'RESELLER',
  PROFESSIONAL = 'PROFESSIONAL',
  ADMIN = 'Admin',
  RESTAURANT = 'RESTAURANT',
}

export default interface Role {
  id: string,
  code: RoleCode
}
