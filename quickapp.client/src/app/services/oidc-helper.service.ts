// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { LocalStoreManager } from './local-store-manager.service';
import { DBkeys } from './db-keys';
import { LoginResponse } from '../models/login-response.model';

@Injectable()
export class OidcHelperService {
  private readonly clientId = 'quickapp_spa';
  private readonly scope = 'openid email phone profile offline_access roles';

  private readonly tokenEndpoint = '/connect/token';

  constructor(
    private http: HttpClient,
    private localStorage: LocalStoreManager) {

  }

  loginWithPassword(userName: string, password: string) {
    const header = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const params = new HttpParams()
      .append('username', userName)
      .append('password', password)
      .append('client_id', this.clientId)
      .append('grant_type', 'password')
      .append('scope', this.scope);

    return this.http.post<LoginResponse>(this.tokenEndpoint, params, { headers: header });
  }

  refreshLogin() {
    const header = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const params = new HttpParams()
      .append('refresh_token', this.refreshToken ?? '')
      .append('client_id', this.clientId)
      .append('grant_type', 'refresh_token');

    return this.http.post<LoginResponse>(this.tokenEndpoint, params, { headers: header });
  }

  get accessToken(): string | null {
    return this.localStorage.getData(DBkeys.ACCESS_TOKEN);
  }

  get accessTokenExpiryDate(): Date | null {
    return this.localStorage.getDataObject<Date>(DBkeys.TOKEN_EXPIRES_IN, true);
  }

  get refreshToken(): string | null {
    return this.localStorage.getData(DBkeys.REFRESH_TOKEN);
  }

  get isSessionExpired(): boolean {
    if (this.accessTokenExpiryDate == null) {
      return true;
    }

    return this.accessTokenExpiryDate.valueOf() <= new Date().valueOf();
  }
}
