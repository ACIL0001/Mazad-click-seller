import Attachment from './Attachment';
import Device from './Device';
import Preference from './Preference';
import Rating from './Rating';
import Restaurant from './Restaurant';
import Role, { RoleCode } from './Role';

export default interface Auth<T = undefined> {
    accessToken: string;
    refreshToken: string;
    user:{
        _id?: string;
        firstname: string;
        lastname: string;
        name: string;
        email: string;
        isMale: boolean;
        picture?: Attachment;
        tel: number;
        device?: Device;
        password?: string;
        role?: RoleCode;
        verified?: boolean;
        enabled?: boolean;
        rating?: Rating;
        details?: T;
        preference?: Preference;
        firstSignIn?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }
  
}
