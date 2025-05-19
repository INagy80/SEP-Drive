import {kundeDto} from "./kunde-dto";


export interface AuthenticationResponse {
  token?: string;
  kundeDTO?: kundeDto

}
