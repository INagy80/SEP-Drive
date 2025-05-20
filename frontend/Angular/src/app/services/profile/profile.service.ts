import { Injectable } from '@angular/core';
import {environment} from '../../../eviroments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {ProfileDTO} from '../../models/profileDTO';
import {CustomerCardDTO} from '../../models/customerCardDTO';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private readonly searchUrl = `${environment.api.baseUrl}/${environment.api.profileSucheUrl}`;
  private readonly profileUrl = `${environment.api.baseUrl}/${environment.api.profileUrl}`;

  constructor(private http: HttpClient) { }

  search(search: string) : Observable<ProfileDTO[]> {
    const params = new HttpParams().set('userName', search);
    return this.http.get<ProfileDTO[]>(`${this.searchUrl}/username`, {params});
  }



  getmyProfile() : Observable<ProfileDTO> {
    return this.http.get<ProfileDTO>(`${this.profileUrl}/getmyProfile`);
  }

  getMyPhotoAsBlob(): Observable<Blob> {
    return this.http
      .get<string>(`${this.profileUrl}/getmyPhoto`, { responseType: 'text' as 'json' })
      .pipe(
        map(base64 => {
          // strip out any "data:…;base64," prefix if present
          const cleaned = base64.replace(/^data:.*;base64,/, '');
          const binary = atob(cleaned);
          const len    = binary.length;
          const bytes  = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          return new Blob([bytes], { type: 'image/jpeg' });
        })
      );
  }


  getOthersPhoto(userName: string): Observable<(Blob|null)[]> {
    const params = new HttpParams().set('userName', userName);
    return this.http
      .get<string[]>(`${this.searchUrl}/getOthersPhoto`, { params })
      .pipe(
        map(base64Arr => {
          // If the server gave us a non‐array, just return an all‐null array
          if (!Array.isArray(base64Arr)) {
            return [];
          }
          return base64Arr.map(b64 => {
            // b64 === null  OR  empty string
            if (!b64) {
              return null;
            }
            // strip any data:…;base64, prefix
            const cleaned = b64.replace(/^data:.*;base64,/, '');
            const binary = atob(cleaned);
            const len    = binary.length;
            const bytes  = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            return new Blob([bytes], { type: 'image/jpeg' });
          });
        })
      );
  }

  /** helper to convert one Base64 string into a Blob */
  private base64ToBlob(base64: string, mime: string): Blob {
    // strip any data URL prefix
    const cleaned = base64.replace(/^data:.*;base64,/, '');
    const binary = atob(cleaned);
    const len    = binary.length;
    const bytes  = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }


  getProfileByUsername(userName : String) : Observable<ProfileDTO> {
    return this.http.get<ProfileDTO>(`${this.searchUrl}/getProfileByUsername/${userName}`);
  }



  getPhotoByUsername(userName: string): Observable<Blob> {
    // const params = new HttpParams().set('userName', username);
    return this.http
      .get(
        // no “/${username}” here:
        `${this.searchUrl}/getPhotoByUsername/${userName}`,
        { responseType: 'text' }
      )
      .pipe(
        map(base64 => {
          if (!base64) {
            return new Blob([], { type: 'image/jpeg' });
          }
          return this.base64ToBlob(base64, 'image/jpeg');
        })
      );
  }

}
