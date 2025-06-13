export interface MailData<T = never> {
  to: string;
  data: T;
  sendVerification:boolean,
  verificationType:string,
  userId:string|number
}
